import { RequestHandler } from "express";
import {
  processSquarePayment,
  getSquareLocations,
  getCheckoutApi,
  getOrdersApi,
  getPaymentsApi,
  createSquarePaymentLink,
} from "../utils/square";
import {
  createSupabaseOrder,
  createOrderItems,
  updateCustomerStoreCredit,
} from "../utils/supabase";

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
  appliedStoreCredit?: number;
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
      checkoutData.amount === undefined ||
      checkoutData.amount === null ||
      !checkoutData.items ||
      !Array.isArray(checkoutData.items) ||
      checkoutData.items.length === 0 ||
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

    // Build the redirect URL for after payment
    let baseUrl = "http://localhost:8080";
    if (process.env.BASE_URL) {
      baseUrl = process.env.BASE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.FLY_APP_NAME) {
      baseUrl = `https://${process.env.FLY_APP_NAME}.fly.dev`;
    }

    const redirectUrl = `${baseUrl}/checkout-success?orderId=${supabaseOrder.id}`;

    // Create Square Payment Link
    const paymentLinkResult = await createSquarePaymentLink({
      orderId: supabaseOrder.id,
      amount: checkoutData.total,
      currency: checkoutData.currency || "USD",
      description: `Order #${supabaseOrder.id} - ${checkoutData.items.length} item(s)`,
      customerEmail: checkoutData.customerEmail,
      customerName: checkoutData.customerName || "Customer",
      redirectUrl,
    });

    if (!paymentLinkResult.success || !paymentLinkResult.paymentLinkUrl) {
      console.error(
        "Failed to create Square payment link:",
        paymentLinkResult.error,
      );
      return res.status(400).json({
        error: paymentLinkResult.error || "Failed to create payment link",
      });
    }

    console.log("Square Payment Link created successfully:", {
      orderId: supabaseOrder.id,
      total: checkoutData.total,
    });

    res.status(201).json({
      success: true,
      order: {
        id: supabaseOrder.id,
        status: "pending_payment",
        total: checkoutData.total,
      },
      checkoutUrl: paymentLinkResult.paymentLinkUrl,
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

    // Handle store credit: deduct applied credit and award earned credit
    if (paymentData.customerId) {
      const appliedCredit = paymentData.appliedStoreCredit || 0;
      const earnedCredit = paymentData.total * 0.05;

      if (appliedCredit > 0) {
        await updateCustomerStoreCredit(
          paymentData.customerId,
          -appliedCredit,
          `Applied to order ${supabaseOrder.id}`,
        );
      }

      await updateCustomerStoreCredit(
        paymentData.customerId,
        earnedCredit,
        `Earned 5% from order ${supabaseOrder.id}`,
      );
    }

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

/**
 * Handle Square webhook for payment completion
 */
export const handleSquareWebhook: RequestHandler = async (req, res) => {
  try {
    const event = req.body;
    const { supabase } = await import("../utils/supabase");

    console.log("Received Square webhook:", {
      type: event.type,
      eventId: event.id,
    });

    // Handle payment link completed events
    if (event.type === "payment_link.completed") {
      const paymentLinkId = event.data?.object?.id;
      const paymentId = event.data?.object?.payment_id;

      if (paymentId) {
        console.log("Processing completed payment:", paymentId);

        // Get the order associated with this payment
        const { data: order } = await supabase
          .from("orders")
          .select("id, customer_id, total")
          .eq("status", "pending_payment")
          .limit(1)
          .single();

        if (order) {
          // Update order status to paid
          await supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", order.id);

          // Award store credit (5% of order total)
          const earnedCredit = order.total * 0.05;
          await updateCustomerStoreCredit(
            order.customer_id,
            earnedCredit,
            `Earned 5% from order ${order.id}`,
          );

          console.log("Order status updated to paid:", {
            orderId: order.id,
            earnedCredit,
          });
        }
      }
    }

    // Acknowledge webhook receipt to Square
    res.json({ received: true });
  } catch (error) {
    console.error("Square webhook error:", error);
    res.status(200).json({
      received: true,
      warning: "Webhook processed with errors",
    });
  }
};
