import { RequestHandler } from "express";
import { bigCommerceAPI } from "../utils/bigcommerce";

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
    quantity: number;
    price_inc_tax?: number;
  }>;
  order_total?: number;
  subtotal_inc_tax?: number;
  subtotal_ex_tax?: number;
  total_inc_tax?: number;
  total_ex_tax?: number;
  total_tax?: number;
  total_shipping?: number;
  status_id?: number;
}

/**
 * Create an order from checkout
 */
export const handleCheckout: RequestHandler = async (req, res) => {
  try {
    const checkoutData = req.body as CheckoutRequest;

    // Validate required fields
    if (
      !checkoutData.customer_id ||
      !checkoutData.billing_address ||
      !checkoutData.shipping_addresses ||
      !checkoutData.products ||
      checkoutData.products.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required fields: customer_id, billing_address, shipping_addresses, products",
      });
    }

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
    if (!checkoutData.shipping_addresses || checkoutData.shipping_addresses.length === 0) {
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

    // Build the order payload for BigCommerce
    const orderPayload: any = {
      customer_id: checkoutData.customer_id,
      billing_address: {
        first_name: billingAddr.first_name,
        last_name: billingAddr.last_name,
        street_1: billingAddr.street_1,
        street_2: billingAddr.street_2 || "",
        city: billingAddr.city,
        state_or_province: billingAddr.state_or_province,
        postal_code: billingAddr.postal_code,
        country_code: billingAddr.country_code,
      },
      shipping_addresses: [
        {
          first_name: shippingAddr.first_name,
          last_name: shippingAddr.last_name,
          street_1: shippingAddr.street_1,
          street_2: shippingAddr.street_2 || "",
          city: shippingAddr.city,
          state_or_province: shippingAddr.state_or_province,
          postal_code: shippingAddr.postal_code,
          country_code: shippingAddr.country_code,
          address_type: "shipment",
        },
      ],
      products: checkoutData.products.map((product) => ({
        product_id: product.product_id,
        quantity: product.quantity,
        price_inc_tax: product.price_inc_tax || 0,
      })),
      status_id: checkoutData.status_id || 0,
    };

    // Add totals if provided
    if (checkoutData.order_total !== undefined) {
      orderPayload.order_total = checkoutData.order_total;
    }
    if (checkoutData.subtotal_inc_tax !== undefined) {
      orderPayload.subtotal_inc_tax = checkoutData.subtotal_inc_tax;
    }
    if (checkoutData.subtotal_ex_tax !== undefined) {
      orderPayload.subtotal_ex_tax = checkoutData.subtotal_ex_tax;
    }
    if (checkoutData.total_inc_tax !== undefined) {
      orderPayload.total_inc_tax = checkoutData.total_inc_tax;
    }
    if (checkoutData.total_ex_tax !== undefined) {
      orderPayload.total_ex_tax = checkoutData.total_ex_tax;
    }
    if (checkoutData.total_tax !== undefined) {
      orderPayload.total_tax = checkoutData.total_tax;
    }
    if (checkoutData.total_shipping !== undefined) {
      orderPayload.total_shipping = checkoutData.total_shipping;
    }

    console.log("Creating order in BigCommerce with data:", {
      customerId: checkoutData.customer_id,
      productCount: checkoutData.products.length,
      hasAddresses: true,
    });

    // Create order in BigCommerce
    const order = await bigCommerceAPI.createOrder(orderPayload);

    if (!order || !order.id) {
      throw new Error("Order created but no ID returned from BigCommerce");
    }

    console.log("Order created successfully:", order.id);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        id: order.id,
        customer_id: order.customer_id,
        total: order.total_inc_tax || order.order_total,
        status: order.status,
        date_created: order.date_created,
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
