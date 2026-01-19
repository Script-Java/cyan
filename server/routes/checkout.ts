import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseOrder, createOrderItems } from "../utils/supabase";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Validate UUID format (v4 and general UUID)
 * Matches format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

interface CheckoutRequest {
  customer_id: number;
  billing_address: {
    first_name: string;
    last_name: string;
    street_1: string;
    street_2?: string;
    city: string;
    state_or_province: string;
    postal_code: string;
    country_code: string;
  };
  shipping_addresses: Array<{
    first_name: string;
    last_name: string;
    street_1: string;
    street_2?: string;
    city: string;
    state_or_province: string;
    postal_code: string;
    country_code: string;
  }>;
  products: Array<{
    product_id: number;
    product_name?: string;
    quantity: number;
    price_inc_tax?: number;
    price?: number;
    design_file_url?: string;
    options?: Array<{
      option_id?: string | number;
      option_name?: string;
      option_value?: string;
      modifier_price?: number;
      price?: number;
    }>;
  }>;
  order_total?: number;
  subtotal_inc_tax?: number;
  subtotal_ex_tax?: number;
  total_inc_tax?: number;
  total_ex_tax?: number;
  total_tax?: number;
  total_shipping?: number;
  status_id?: number;
  shipping_option_id?: number;
}

/**
 * Create an order from checkout
 * Primary: Supabase (always succeeds)
 * Secondary: Ecwid (optional, errors are logged but don't fail the order)
 */
export const handleCheckout: RequestHandler = async (req, res) => {
  try {
    const checkoutData = req.body as CheckoutRequest;
    const requestCustomerId = (req as any).customerId;

    // Validate required fields (customer_id is optional for guest checkout)
    if (
      !checkoutData.billing_address ||
      !checkoutData.shipping_addresses ||
      !checkoutData.products ||
      checkoutData.products.length === 0
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: billing_address, shipping_addresses, products",
      });
    }

    // Use customer_id from request (auth) or from body (guest/provided), default to null for guests
    const customerId = requestCustomerId || checkoutData.customer_id || null;

    // Validate billing address
    const billingAddr = checkoutData.billing_address;
    if (
      !billingAddr.first_name ||
      !billingAddr.last_name ||
      !billingAddr.street_1 ||
      !billingAddr.city ||
      !billingAddr.state_or_province ||
      !billingAddr.postal_code ||
      !billingAddr.country_code
    ) {
      return res.status(400).json({
        error: "Incomplete billing address",
      });
    }

    // Validate shipping address
    if (
      !checkoutData.shipping_addresses ||
      checkoutData.shipping_addresses.length === 0
    ) {
      return res.status(400).json({
        error: "At least one shipping address is required",
      });
    }

    const shippingAddr = checkoutData.shipping_addresses[0];
    if (
      !shippingAddr.first_name ||
      !shippingAddr.last_name ||
      !shippingAddr.street_1 ||
      !shippingAddr.city ||
      !shippingAddr.state_or_province ||
      !shippingAddr.postal_code ||
      !shippingAddr.country_code
    ) {
      return res.status(400).json({
        error: "Incomplete shipping address",
      });
    }

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
