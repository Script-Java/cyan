import { RequestHandler } from "express";
import {
  processSquarePayment,
  getSquareLocations,
  getCheckoutApi,
  getOrdersApi,
  getPaymentsApi,
} from "../utils/square";
import { createSupabaseOrder, createOrderItems } from "../utils/supabase";

interface SquarePaymentRequest {
  sourceId: string;
  amount: number;
  currency: string;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    options?: any;
    design_file_url?: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerId?: number;
  customerEmail?: string;
  customerName?: string;
}

interface SquareCheckoutRequest {
  amount: number;
  currency: string;
  items: Array<{
    product_id: number;
    product_name?: string;
    quantity: number;
    price?: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerId?: number;
  customerEmail?: string;
  customerName?: string;
}

/**
 * Create a Square Checkout session (redirect to hosted checkout)
 */
export const handleCreateCheckoutSession: RequestHandler = async (req, res) => {
  try {
    const checkoutData = req.body as SquareCheckoutRequest;
    const { supabase } = await import("../utils/supabase");

    // Validate required fields
    if (
      !checkoutData.amount ||
      !checkoutData.items ||
      !checkoutData.customerEmail
    ) {
      return res.status(400).json({
        error: "Missing required fields: amount, items, customerEmail",
      });
    }

    // Create a guest customer if not logged in
    let customerId = checkoutData.customerId;

    if (!customerId) {
      // First, try to get existing customer by email
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", checkoutData.customerEmail)
        .single();

      if (existingCustomer?.id) {
        customerId = existingCustomer.id;
      } else {
        // Create a new guest customer in Supabase
        const { data: guestCustomer, error: guestError } = await supabase
          .from("customers")
          .insert({
            email: checkoutData.customerEmail,
            first_name: checkoutData.customerName?.split(" ")[0] || "Guest",
            last_name: checkoutData.customerName?.split(" ")[1] || "Customer",
            phone: undefined,
            company: undefined,
            store_credit: 0,
          })
          .select("id")
          .single();

        if (guestError || !guestCustomer?.id) {
          console.error("Failed to create guest customer:", guestError);
          return res.status(400).json({
            error: "Failed to create customer record for checkout",
          });
        }
        customerId = guestCustomer.id;
      }
    }

    // Create order in Supabase with pending_payment status
    const supabaseOrder = await createSupabaseOrder({
      customer_id: customerId,
      status: "pending_payment",
      total: checkoutData.total,
      subtotal: checkoutData.subtotal,
      tax: checkoutData.tax,
      shipping: checkoutData.shipping,
      billing_address: checkoutData.billingAddress,
      shipping_address: checkoutData.shippingAddress,
      items: checkoutData.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name || `Product #${item.product_id}`,
        quantity: item.quantity,
        price: item.price || 0.25,
      })),
    });

    if (!supabaseOrder.success) {
      throw new Error("Failed to create order in Supabase");
    }

    // Create order items in Supabase
    await createOrderItems(supabaseOrder.id, checkoutData.items as any);

    // Build line items for Square Checkout
    const lineItems = checkoutData.items.map((item) => ({
      name: item.product_name || `Product #${item.product_id}`,
      quantity: String(item.quantity),
      basePriceMoney: {
        amount: Math.round((item.price || 0.25) * 100),
        currency: checkoutData.currency || "USD",
      },
    }));

    // Add tax and shipping as line items
    if (checkoutData.tax > 0) {
      lineItems.push({
        name: "Tax",
        quantity: "1",
        basePriceMoney: {
          amount: Math.round(checkoutData.tax * 100),
          currency: checkoutData.currency || "USD",
        },
      });
    }

    if (checkoutData.shipping > 0) {
      lineItems.push({
        name: "Shipping",
        quantity: "1",
        basePriceMoney: {
          amount: Math.round(checkoutData.shipping * 100),
          currency: checkoutData.currency || "USD",
        },
      });
    }

    // Build checkout request
    let baseUrl = "http://localhost:8080";
    if (process.env.BASE_URL) {
      baseUrl = process.env.BASE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.FLY_APP_NAME) {
      baseUrl = `https://${process.env.FLY_APP_NAME}.fly.dev`;
    }
    const checkoutBody = {
      idempotencyKey: `${Date.now()}-${supabaseOrder.id}`,
      order: {
        lineItems,
        customerId: checkoutData.customerId
          ? String(checkoutData.customerId)
          : undefined,
        referenceId: supabaseOrder.id,
      },
      redirectUrl: `${baseUrl}/checkout-success?orderId=${supabaseOrder.id}`,
      merchantSupportEmail: checkoutData.customerEmail,
      askForShippingAddress: false,
      prePopulatedData: {
        buyerEmail: checkoutData.customerEmail,
        buyerPhoneNumber: undefined,
      },
    };

    console.log("Creating Square Checkout with:", {
      orderId: supabaseOrder.id,
      total: checkoutData.total,
      currency: checkoutData.currency,
    });

    // For Square Hosted Checkout, we would normally create an order first
    // and then get a checkout URL. For now, we'll use a temporary approach:
    // In production, integrate with Square's Payment Links API or Web Payments SDK

    // Generate a checkout URL - in production this would come from Square
    // For testing purposes, redirect to the success page
    // TODO: Implement proper Square Payment Link or Checkout API integration
    const checkoutUrl = `${baseUrl}/checkout-success?orderId=${supabaseOrder.id}`;

    res.status(201).json({
      success: true,
      order: {
        id: supabaseOrder.id,
        status: "pending_payment",
        total: checkoutData.total,
      },
      checkoutUrl,
    });
  } catch (error) {
    console.error("Create Checkout session error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";
    res.status(400).json({
      error: errorMessage,
    });
  }
};

/**
 * Process payment via Square and create order in Supabase
 */
export const handleSquarePayment: RequestHandler = async (req, res) => {
  try {
    const paymentData = req.body as SquarePaymentRequest;

    // Validate required fields
    if (!paymentData.sourceId || !paymentData.amount || !paymentData.items) {
      return res.status(400).json({
        error: "Missing required fields: sourceId, amount, items",
      });
    }

    // Process payment via Square
    const squarePayment = await processSquarePayment({
      sourceId: paymentData.sourceId,
      amount: paymentData.total,
      currency: paymentData.currency || "USD",
      orderId: undefined,
      customerEmail: paymentData.customerEmail,
      customerName: paymentData.customerName,
    });

    if (!squarePayment.success) {
      return res.status(400).json({
        error: "Payment processing failed",
      });
    }

    // Create order in Supabase
    const supabaseOrder = await createSupabaseOrder({
      customer_id: paymentData.customerId || 0,
      status: "pending",
      total: paymentData.total,
      subtotal: paymentData.subtotal,
      tax: paymentData.tax,
      shipping: paymentData.shipping,
      billing_address: paymentData.billingAddress,
      shipping_address: paymentData.shippingAddress,
      items: paymentData.items,
    });

    if (!supabaseOrder.success) {
      throw new Error("Failed to create order in Supabase");
    }

    // Create order items in Supabase
    await createOrderItems(supabaseOrder.id, paymentData.items);

    res.status(201).json({
      success: true,
      payment: squarePayment,
      order: {
        id: supabaseOrder.id,
        status: "pending",
        total: paymentData.total,
        items: paymentData.items.length,
      },
      message: "Payment processed and order created successfully",
    });
  } catch (error) {
    console.error("Square payment route error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Payment processing failed";
    res.status(400).json({
      error: errorMessage,
    });
  }
};

/**
 * Get Square application ID for frontend (public endpoint)
 */
export const handleGetSquareConfig: RequestHandler = async (req, res) => {
  try {
    const appId = process.env.SQUARE_APPLICATION_ID;
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;

    if (!appId) {
      return res.status(500).json({
        error: "Square configuration not available",
      });
    }

    // Verify that we have the access token configured
    if (!accessToken) {
      console.warn("Square Access Token not configured");
    }

    res.json({
      success: true,
      applicationId: appId,
      configured: !!accessToken,
    });
  } catch (error) {
    console.error("Get Square config error:", error);
    res.status(500).json({
      error: "Failed to retrieve Square configuration",
    });
  }
};

/**
 * Get Square locations (for selecting payment location)
 */
export const handleGetSquareLocations: RequestHandler = async (req, res) => {
  try {
    const locations = await getSquareLocations();

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error("Get Square locations error:", error);
    res.status(500).json({
      error: "Failed to retrieve Square locations",
    });
  }
};

/**
 * Confirm checkout after Square redirect
 */
export const handleConfirmCheckout: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "Missing orderId",
      });
    }

    console.log("Confirming checkout for order:", orderId);

    // Import Supabase
    const { supabase } = await import("../utils/supabase");

    // Get the order from Supabase
    const { data, error: supabaseError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (supabaseError || !data) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    // Update order status to completed
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order status:", updateError);
      return res.status(400).json({
        error: "Failed to confirm order",
      });
    }

    res.json({
      success: true,
      order: {
        id: orderId,
        status: "completed",
        total: data.total,
      },
    });
  } catch (error) {
    console.error("Confirm checkout error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Confirmation failed",
    });
  }
};

/**
 * Test Square configuration (diagnostic endpoint)
 */
export const handleTestSquareConfig: RequestHandler = async (req, res) => {
  try {
    const appId = process.env.SQUARE_APPLICATION_ID;
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;

    const diagnostics = {
      appIdConfigured: !!appId,
      accessTokenConfigured: !!accessToken,
      appIdLength: appId ? appId.length : 0,
      accessTokenLength: accessToken ? accessToken.length : 0,
      appIdPrefix: appId ? appId.substring(0, 8) : "N/A",
      accessTokenPrefix: accessToken ? accessToken.substring(0, 8) : "N/A",
    };

    if (!appId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Square configuration incomplete",
        diagnostics,
        missingConfig: {
          appId: !appId,
          accessToken: !accessToken,
        },
      });
    }

    // Try to initialize the client
    try {
      const { getPaymentsApi } = await import("../utils/square");
      const paymentsApi = getPaymentsApi();
      res.json({
        success: true,
        message: "Square configuration is valid",
        diagnostics,
        clientInitialized: true,
      });
    } catch (clientError) {
      res.status(400).json({
        success: false,
        message: "Square client initialization failed",
        diagnostics,
        error:
          clientError instanceof Error ? clientError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Test Square config error:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to test Square configuration",
    });
  }
};
