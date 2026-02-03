import { RequestHandler } from "express";
import { z } from "zod";
import {
  createSupabaseOrder,
  createOrderItems,
  getScopedSupabaseClient,
  supabase,
} from "../utils/supabase";
import { CheckoutSchema, validate } from "../schemas/validation";

/**
 * Extended checkout schema with optional fields for backward compatibility
 * Allows extra fields from Ecwid/BigCommerce integrations
 */
const ExtendedCheckoutSchema = CheckoutSchema.extend({
  order_total: z.number().optional(),
  subtotal_inc_tax: z.number().optional(),
  subtotal_ex_tax: z.number().optional(),
  total_inc_tax: z.number().optional(),
  total_ex_tax: z.number().optional(),
  total_tax: z.number().optional(),
  total_shipping: z.number().optional(),
  status_id: z.number().optional(),
  shipping_option_id: z.number().optional(),
}).passthrough(); // Allow unknown fields from integrations

/**
 * Create an order from checkout
 * Primary: Supabase (always succeeds)
 * Secondary: Ecwid (optional, errors are logged but don't fail the order)
 * VALIDATION: All request fields validated against schema before processing
 */
export const handleCheckout: RequestHandler = async (req, res) => {
  try {
    const requestCustomerId = (req as any).customerId;

    // VALIDATION: Validate entire checkout request
    // This replaces all manual if (!field) checks
    const validationResult = await validate(ExtendedCheckoutSchema, req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Request validation failed",
        details: validationResult.errors,
      });
    }

    const checkoutData = validationResult.data;

    // Use customer_id from request (auth) or from body (guest/provided), default to null for guests
    const customerId = requestCustomerId || checkoutData.customer_id || null;

    // At this point, all required fields are validated and present
    const billingAddr = checkoutData.billing_address;
    const shippingAddr = checkoutData.shipping_addresses[0];

    // Calculate totals
    const subtotal = checkoutData.subtotal_inc_tax || 0;
    const total =
      checkoutData.order_total || checkoutData.total_inc_tax || subtotal;
    const tax = checkoutData.total_tax || 0;
    const shipping = checkoutData.total_shipping || 0;

    // Calculate estimated delivery date based on shipping option
    let estimatedDeliveryDate: string | null = null;
    if (checkoutData.shipping_option_id) {
      try {
        const { data: shippingOption } = await supabase
          .from("shipping_options")
          .select("processing_time_days, estimated_delivery_days_min")
          .eq("id", checkoutData.shipping_option_id)
          .single();

        if (shippingOption) {
          const processingDays = shippingOption.processing_time_days || 0;
          const deliveryDays = shippingOption.estimated_delivery_days_min || 1;
          const totalDays = processingDays + deliveryDays;

          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + totalDays);
          estimatedDeliveryDate = deliveryDate.toISOString().split("T")[0];
        }
      } catch (error) {
        console.warn(
          "Failed to fetch shipping option for delivery date:",
          error,
        );
      }
    }

    // Create order in Supabase (PRIMARY - must succeed)
    console.log("Creating order in Supabase:", {
      customerId,
      total,
      productCount: checkoutData.products.length,
      estimatedDeliveryDate,
    });

    const supabaseOrder = await createSupabaseOrder({
      customer_id: customerId,
      status: "pending",
      total,
      subtotal,
      tax,
      shipping,
      billing_address: billingAddr,
      shipping_address: shippingAddr,
      items: checkoutData.products,
      estimated_delivery_date: estimatedDeliveryDate,
    });

    // Create order items in Supabase
    if (supabaseOrder.success) {
      const itemsWithPrices = checkoutData.products.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name || "Custom Product",
        quantity: item.quantity,
        price: item.price || item.price_inc_tax || 0.25,
        design_file_url: item.design_file_url || null,
        options: item.options || null,
      }));
      await createOrderItems(supabaseOrder.id, itemsWithPrices);
    }

    console.log("Order created successfully:", {
      supabaseId: supabaseOrder.id,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: supabaseOrder.id,
        customer_id: customerId,
        total,
        status: "pending",
        date_created: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create order";
    res.status(500).json({
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
};

/**
 * Get checkout details (for validation/preview)
 */
export const handleGetCheckoutDetails: RequestHandler = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ error: "Cart ID is required" });
    }

    if (!isValidUUID(cartId)) {
      return res.status(400).json({ error: "Invalid cart ID format" });
    }

    // This would typically fetch cart details and shipping estimates
    // For now, return placeholder data
    res.json({
      success: true,
      data: {
        cart_id: cartId,
        shipping_methods: [
          {
            id: "standard",
            name: "Standard Shipping",
            cost: 9.99,
            estimated_days: "5-7 business days",
          },
          {
            id: "express",
            name: "Express Shipping",
            cost: 19.99,
            estimated_days: "2-3 business days",
          },
          {
            id: "overnight",
            name: "Overnight Shipping",
            cost: 39.99,
            estimated_days: "Next business day",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Get checkout details error:", error);
    res.status(500).json({ error: "Failed to get checkout details" });
  }
};
