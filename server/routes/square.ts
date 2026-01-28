import { RequestHandler } from "express";
import {
  processSquarePayment,
  getSquareLocations,
  getCheckoutApi,
  getOrdersApi,
  getPaymentsApi,
  createSquarePaymentLink,
  isValidCountryCode,
  isValidEmail,
  isValidPhone,
  isValidAddress,
  sanitizeInput,
} from "../utils/square";
import {
  createSupabaseOrder,
  createOrderItems,
  updateCustomerStoreCredit,
} from "../utils/supabase";
import { sendOrderConfirmationEmail } from "../utils/email";
import { formatOrderNumber } from "../utils/order";

interface SquarePaymentRequest {
  sourceId: string;
  amount: number;
  currency: string;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
    design_file_url?: string;
    options?: Array<{
      option_id?: string | number;
      option_name?: string;
      option_value?: string;
      modifier_price?: number;
      price?: number;
    }>;
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
    design_file_url?: string;
    options?: Array<{
      option_id?: string | number;
      option_name?: string;
      option_value?: string;
      modifier_price?: number;
      price?: number;
    }>;
  }>;
  phone?: string;
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
  discount?: number;
  discountCode?: string;
  customerId?: number;
  customerEmail?: string;
  customerName?: string;
  shipping_option_id?: number;
  shipping_option_name?: string;
  estimated_delivery_date?: string;
  policies?: {
    returnAndRefund: boolean;
    privacy: boolean;
    gdpr: boolean;
    ccpa: boolean;
    terms: boolean;
    shipping: boolean;
  };
}

/**
 * Create a Square Checkout session (redirect to hosted checkout)
 */
export const handleCreateCheckoutSession: RequestHandler = async (req, res) => {
  try {
    const checkoutData = req.body as SquareCheckoutRequest;
    const { supabase } = await import("../utils/supabase");

    console.log("handleCreateCheckoutSession called with data:", {
      amount: checkoutData.amount,
      itemsCount: checkoutData.items?.length,
      hasCustomerEmail: !!checkoutData.customerEmail,
      hasShippingAddress: !!checkoutData.shippingAddress,
      subtotal: checkoutData.subtotal,
      tax: checkoutData.tax,
      shipping: checkoutData.shipping,
      total: checkoutData.total,
    });

    // Validate required fields with detailed error messages
    const missingFields: string[] = [];

    if (checkoutData.amount === undefined || checkoutData.amount === null) {
      missingFields.push("amount");
    }
    if (
      !checkoutData.items ||
      !Array.isArray(checkoutData.items) ||
      checkoutData.items.length === 0
    ) {
      missingFields.push("items");
    }
    if (!checkoutData.customerEmail) {
      missingFields.push("customerEmail");
    }
    if (!checkoutData.shippingAddress) {
      missingFields.push("shippingAddress");
    }
    if (!checkoutData.billingAddress) {
      missingFields.push("billingAddress");
    }
    if (checkoutData.subtotal === undefined || checkoutData.subtotal === null) {
      missingFields.push("subtotal");
    }
    if (checkoutData.tax === undefined || checkoutData.tax === null) {
      missingFields.push("tax");
    }
    if (checkoutData.shipping === undefined || checkoutData.shipping === null) {
      missingFields.push("shipping");
    }
    if (checkoutData.total === undefined || checkoutData.total === null) {
      missingFields.push("total");
    }

    if (missingFields.length > 0) {
      console.error("Missing required fields:", {
        missingFields,
        receivedData: {
          amount: checkoutData.amount,
          items: checkoutData.items?.length,
          customerEmail: checkoutData.customerEmail,
          shippingAddress: !!checkoutData.shippingAddress,
          billingAddress: !!checkoutData.billingAddress,
          subtotal: checkoutData.subtotal,
          tax: checkoutData.tax,
          shipping: checkoutData.shipping,
          total: checkoutData.total,
        },
      });
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate and sanitize country codes
    const invalidCountries: string[] = [];

    // Fix invalid shipping country code
    if (
      checkoutData.shippingAddress?.country &&
      !isValidCountryCode(checkoutData.shippingAddress.country)
    ) {
      invalidCountries.push(
        `shipping: ${checkoutData.shippingAddress.country}`,
      );
      checkoutData.shippingAddress.country = "US"; // Default to US if invalid
    }

    // Fix invalid billing country code
    if (
      checkoutData.billingAddress?.country &&
      !isValidCountryCode(checkoutData.billingAddress.country)
    ) {
      invalidCountries.push(`billing: ${checkoutData.billingAddress.country}`);
      checkoutData.billingAddress.country = "US"; // Default to US if invalid
    }

    if (invalidCountries.length > 0) {
      console.warn(
        "Invalid country codes detected and auto-corrected to US:",
        invalidCountries,
      );
    }

    // Validate email format
    if (!isValidEmail(checkoutData.customerEmail)) {
      console.error("Invalid email format provided");
      return res.status(400).json({
        success: false,
        error: "Invalid email address format",
      });
    }

    // Validate phone if provided
    if (checkoutData.phone && !isValidPhone(checkoutData.phone)) {
      console.error("Invalid phone format provided");
      return res.status(400).json({
        success: false,
        error: "Invalid phone number format",
      });
    }

    // Validate shipping address fields
    if (
      !isValidAddress(checkoutData.shippingAddress.street) ||
      !isValidAddress(checkoutData.shippingAddress.city) ||
      !isValidAddress(checkoutData.shippingAddress.postalCode)
    ) {
      console.error("Invalid shipping address format");
      return res.status(400).json({
        success: false,
        error: "Invalid shipping address format",
      });
    }

    // Validate billing address fields
    if (
      !isValidAddress(checkoutData.billingAddress.street) ||
      !isValidAddress(checkoutData.billingAddress.city) ||
      !isValidAddress(checkoutData.billingAddress.postalCode)
    ) {
      console.error("Invalid billing address format");
      return res.status(400).json({
        success: false,
        error: "Invalid billing address format",
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
            first_name:
              checkoutData.shippingAddress.firstName ||
              checkoutData.customerName?.split(" ")[0] ||
              "Guest",
            last_name:
              checkoutData.shippingAddress.lastName ||
              checkoutData.customerName?.split(" ")[1] ||
              "Customer",
            phone: checkoutData.phone || undefined,
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
    } else if (process.env.NETLIFY_SITE_NAME) {
      baseUrl = `https://${process.env.NETLIFY_SITE_NAME}.netlify.app`;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }

    const redirectUrl = `${baseUrl}/checkout-success?orderId=${supabaseOrder.id}`;

    // Create Square Payment Link with full order details and customer contact info
    const paymentLinkResult = await createSquarePaymentLink({
      orderId: supabaseOrder.id,
      amount: checkoutData.total,
      currency: checkoutData.currency || "USD",
      description: "Sticker Order",
      customerEmail: checkoutData.customerEmail,
      customerName: checkoutData.customerName || "Customer",
      customerPhone: checkoutData.phone,
      customerFirstName: checkoutData.shippingAddress.firstName,
      customerLastName: checkoutData.shippingAddress.lastName,
      redirectUrl,
      subtotal: checkoutData.subtotal,
      tax: checkoutData.tax,
      shipping: checkoutData.shipping,
      shippingOptionId: checkoutData.shipping_option_id,
      shippingOptionName: checkoutData.shipping_option_name,
      estimatedDeliveryDate: checkoutData.estimated_delivery_date,
      items: checkoutData.items.map((item) => ({
        product_name: item.product_name || `Product #${item.product_id}`,
        quantity: item.quantity,
        price: item.price || 0.25,
        options: item.options,
      })),
      shippingAddress: {
        firstName: checkoutData.shippingAddress.firstName,
        lastName: checkoutData.shippingAddress.lastName,
        street: checkoutData.shippingAddress.street,
        street2: checkoutData.shippingAddress.street2,
        city: checkoutData.shippingAddress.city,
        state: checkoutData.shippingAddress.state,
        postalCode: checkoutData.shippingAddress.postalCode,
        country: checkoutData.shippingAddress.country,
      },
    });

    if (!paymentLinkResult.success || !paymentLinkResult.paymentLinkUrl) {
      console.error("Square Payment Link failed - returning error to client:", {
        orderId: supabaseOrder.id,
        error: paymentLinkResult.error,
      });

      // Return error instead of fallback
      return res.status(400).json({
        success: false,
        error: paymentLinkResult.error || "Failed to create payment link",
      });
    }

    console.log("Square Payment Link created successfully:", {
      orderId: supabaseOrder.id,
      total: checkoutData.total,
      paymentLinkUrl: paymentLinkResult.paymentLinkUrl,
    });

    // Send order confirmation email with design thumbnails and policies
    await sendOrderConfirmationEmail({
      customerEmail: checkoutData.customerEmail,
      customerName: checkoutData.customerName || "Valued Customer",
      orderNumber: formatOrderNumber(supabaseOrder.id),
      orderDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      items: checkoutData.items.map((item) => ({
        name: item.product_name || `Product #${item.product_id}`,
        quantity: item.quantity,
        price: item.price || 0.25,
        designFileUrl: item.design_file_url,
        options: (item as any).options,
      })),
      subtotal: checkoutData.subtotal,
      tax: checkoutData.tax,
      shipping: checkoutData.shipping,
      total: checkoutData.total,
      estimatedDelivery: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      orderLink: `${baseUrl}/order-confirmation?orderId=${supabaseOrder.id}`,
      shippingAddress: checkoutData.shippingAddress,
      policies: (checkoutData as any).policies,
    });

    const responsePayload = {
      success: true,
      order: {
        id: supabaseOrder.id,
        status: "pending_payment",
        total: checkoutData.total,
      },
      checkoutUrl: paymentLinkResult.paymentLinkUrl,
    };

    console.log("Sending checkout response:", {
      orderId: supabaseOrder.id,
      hasCheckoutUrl: !!paymentLinkResult.paymentLinkUrl,
    });

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error("Create Checkout session error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";
    console.error("Error details:", {
      message: errorMessage,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : "No stack available",
    });
    res.status(400).json({
      success: false,
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

    const id = parseInt(orderId, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        error: "Invalid order ID format",
      });
    }

    console.log("Confirming checkout for order:", id);

    // Import Supabase
    const { supabase } = await import("../utils/supabase");

    // Get the order from Supabase
    const { data, error: supabaseError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
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
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update order status:", updateError);
      return res.status(400).json({
        error: "Failed to confirm order",
      });
    }

    res.json({
      success: true,
      order: {
        id: id,
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
      const paymentsApi = await getPaymentsApi();
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
 * Handle Square webhook for payment completion and customer events
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

    // Handle customer created events
    if (event.type === "customer.created") {
      await handleSquareCustomerCreated(event.data);
    }

    // Handle customer deleted events
    if (event.type === "customer.deleted") {
      await handleSquareCustomerDeleted(event.data);
    }

    // Handle payment created events
    if (event.type === "payment.created") {
      await handleSquarePaymentCreated(event.data);
    }

    // Handle payment updated events
    if (event.type === "payment.updated") {
      await handleSquarePaymentUpdated(event.data);
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

/**
 * Handle Square customer.created webhook event
 */
async function handleSquareCustomerCreated(data: any): Promise<void> {
  try {
    const { supabase } = await import("../utils/supabase");

    const customer = data?.object?.customer;
    if (!customer) {
      console.warn("No customer data in Square webhook");
      return;
    }

    const squareCustomerId = customer.id;
    const email = customer.email_address;
    const firstName = customer.given_name || "";
    const lastName = customer.family_name || "";
    const phone = customer.phone_number || "";

    console.log("Processing Square customer creation:", {
      squareCustomerId,
      email,
      name: `${firstName} ${lastName}`,
    });

    // Check if customer already exists in Supabase by Square customer ID
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id, square_customer_id")
      .eq("square_customer_id", squareCustomerId)
      .single()
      .catch(() => ({ data: null }));

    if (existingCustomer) {
      // Customer already linked, update their information
      const { error } = await supabase
        .from("customers")
        .update({
          email: email || existingCustomer.id,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id);

      if (error) {
        console.error("Error updating existing Square customer:", error);
      } else {
        console.log(
          "Square customer updated in Supabase:",
          existingCustomer.id,
        );
      }
    } else {
      // Check if customer exists by email
      const { data: customerByEmail } = await supabase
        .from("customers")
        .select("id")
        .eq("email", email)
        .single()
        .catch(() => ({ data: null }));

      if (customerByEmail) {
        // Link existing customer to Square ID
        const { error } = await supabase
          .from("customers")
          .update({
            square_customer_id: squareCustomerId,
            first_name: firstName || customerByEmail.id,
            last_name: lastName || "",
            phone: phone || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerByEmail.id);

        if (error) {
          console.error("Error linking Square customer ID:", error);
        } else {
          console.log(
            "Square customer linked to existing Supabase customer:",
            customerByEmail.id,
          );
        }
      } else {
        // Create new customer in Supabase with Square customer ID
        const { data: newCustomer, error } = await supabase
          .from("customers")
          .insert({
            email: email || `square_${squareCustomerId}@placeholder.com`,
            first_name: firstName || "Square Customer",
            last_name: lastName || "",
            phone: phone || "",
            company: "",
            store_credit: 0,
            square_customer_id: squareCustomerId,
            password_hash: null,
          })
          .select("id")
          .single();

        if (error) {
          console.error("Error creating Square customer in Supabase:", error);
        } else {
          console.log("Square customer created in Supabase:", newCustomer.id);
        }
      }
    }
  } catch (error) {
    console.error("Error processing Square customer creation:", error);
  }
}

/**
 * Handle Square customer.deleted webhook event
 */
async function handleSquareCustomerDeleted(data: any): Promise<void> {
  try {
    const { supabase } = await import("../utils/supabase");

    const squareCustomerId = data?.id;
    if (!squareCustomerId) {
      console.warn("No customer ID in Square deletion webhook");
      return;
    }

    console.log("Processing Square customer deletion:", squareCustomerId);

    // Find customer by Square customer ID
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("square_customer_id", squareCustomerId)
      .single()
      .catch(() => ({ data: null }));

    if (customer) {
      // Unlink the Square customer ID from the Supabase record
      // We preserve the customer record to maintain order history
      const { error } = await supabase
        .from("customers")
        .update({
          square_customer_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

      if (error) {
        console.error("Error unlinking Square customer:", error);
      } else {
        console.log(
          "Square customer unlinked from Supabase record:",
          customer.id,
        );
      }
    } else {
      console.log("Square customer not found in Supabase:", squareCustomerId);
    }
  } catch (error) {
    console.error("Error processing Square customer deletion:", error);
  }
}

/**
 * Handle Square payment.created webhook event
 */
async function handleSquarePaymentCreated(data: any): Promise<void> {
  try {
    const { supabase } = await import("../utils/supabase");

    const payment = data?.object?.payment;
    if (!payment) {
      console.warn("No payment data in Square webhook");
      return;
    }

    const paymentId = payment.id;
    const orderId = payment.order_id;
    const paymentStatus = payment.status;
    const amountMoney = payment.amount_money || {};
    const cardDetails = payment.card_details || {};
    const card = cardDetails.card || {};

    console.log("Processing Square payment creation:", {
      paymentId,
      orderId,
      status: paymentStatus,
      amount: amountMoney.amount,
    });

    // Only process approved payments
    if (paymentStatus !== "APPROVED" && paymentStatus !== "COMPLETED") {
      console.log(`Payment status is ${paymentStatus}, skipping order update`);
      return;
    }

    if (!orderId) {
      console.warn("No order ID associated with payment:", paymentId);
      return;
    }

    // Prepare payment details object to store in order
    const paymentDetails = {
      payment_id: paymentId,
      payment_status: paymentStatus,
      amount: amountMoney.amount ? amountMoney.amount / 100 : 0,
      currency: amountMoney.currency || "USD",
      payment_timestamp: payment.created_at,
      card_brand: card.card_brand || "",
      card_last_4: card.last_4 || "",
      card_exp_month: card.exp_month || null,
      card_exp_year: card.exp_year || null,
      entry_method: cardDetails.entry_method || "",
      receipt_number: payment.receipt_number || "",
    };

    // Get the order from Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, total, items")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.warn(
        "Order not found in Supabase for payment:",
        orderId,
        orderError,
      );
      return;
    }

    // Update order with payment details and mark as paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        square_payment_details: paymentDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order with payment details:", updateError);
      return;
    }

    console.log("Order marked as paid with payment details:", orderId);

    // Award store credit to customer (5% of order total)
    if (order.customer_id) {
      const earnedCredit = order.total * 0.05;
      await updateCustomerStoreCredit(
        order.customer_id,
        earnedCredit,
        `Earned 5% from order ${orderId}`,
      );

      console.log("Store credit awarded for order:", {
        orderId,
        customerId: order.customer_id,
        earnedCredit,
      });
    }
  } catch (error) {
    console.error("Error processing Square payment creation:", error);
  }
}

/**
 * Create a payment using Square's Payments API (POST /v2/payments)
 */
export const handleCreatePayment: RequestHandler = async (req, res) => {
  try {
    const { supabase } = await import("../utils/supabase");
    const paymentRequest = req.body;

    // Validate required fields
    if (!paymentRequest.sourceId || paymentRequest.amount === undefined) {
      console.error("Missing required fields:", {
        sourceId: !!paymentRequest.sourceId,
        amount: paymentRequest.amount,
      });
      return res.status(400).json({
        error: "Missing required fields: sourceId, amount",
      });
    }

    const amountInCents = Math.round(paymentRequest.amount * 100);
    let orderId: number | null = null;
    if (paymentRequest.orderId) {
      orderId = parseInt(paymentRequest.orderId, 10);
      if (isNaN(orderId)) {
        orderId = null;
      }
    }

    console.log("Creating Square payment:", {
      orderId,
      amount: amountInCents,
      currency: paymentRequest.currency || "USD",
    });

    // Create the payment using Square's Payments API
    const paymentBody = {
      sourceId: paymentRequest.sourceId,
      amountMoney: {
        amount: amountInCents,
        currency: paymentRequest.currency || "USD",
      },
      autocomplete: true,
      idempotencyKey: `${Date.now()}-${Math.random()}`,
      ...(orderId && { orderId: orderId.toString() }),
      ...(paymentRequest.customerEmail && {
        receiptEmail: paymentRequest.customerEmail,
      }),
      ...(paymentRequest.customerId && {
        customerId: paymentRequest.customerId.toString(),
      }),
    };

    let payment;
    try {
      const paymentsApi = await getPaymentsApi();
      const response = await paymentsApi.createPayment(paymentBody);

      if (!response.result) {
        throw new Error("No payment result returned from Square API");
      }

      payment = response.result;
    } catch (squareError) {
      console.error("Square API error:", squareError);
      const errorMsg =
        squareError instanceof Error
          ? squareError.message
          : String(squareError);
      return res.status(400).json({
        success: false,
        error: "Payment processing failed",
        details: errorMsg,
      });
    }

    console.log("Square payment created successfully:", {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amountMoney?.amount,
    });

    // Update order with payment details if we have an orderId
    if (orderId && payment.status === "COMPLETED") {
      try {
        const { data: order } = await supabase
          .from("orders")
          .select("id, customer_id, total")
          .eq("id", orderId)
          .single()
          .catch(() => ({ data: null }));

        if (order) {
          const paymentDetails = {
            payment_id: payment.id,
            payment_status: payment.status,
            card_status: payment.cardDetails?.status || "",
            amount: payment.amountMoney?.amount
              ? payment.amountMoney.amount / 100
              : 0,
            currency: payment.amountMoney?.currency || "USD",
            payment_created_at: payment.createdAt,
            payment_updated_at: payment.updatedAt,
            card_brand: payment.cardDetails?.card?.cardBrand || "",
            card_last_4: payment.cardDetails?.card?.last4 || "",
            card_exp_month: payment.cardDetails?.card?.expMonth || null,
            card_exp_year: payment.cardDetails?.card?.expYear || null,
            entry_method: payment.cardDetails?.entryMethod || "",
            receipt_number: payment.receiptNumber || "",
            receipt_url: payment.receiptUrl || "",
            authorized_at:
              payment.cardDetails?.cardPaymentTimeline?.authorizedAt || null,
            captured_at:
              payment.cardDetails?.cardPaymentTimeline?.capturedAt || null,
          };

          // Update order status and payment details
          await supabase
            .from("orders")
            .update({
              status: "paid",
              square_payment_details: paymentDetails,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          // Award store credit
          if (order.customer_id) {
            const earnedCredit = order.total * 0.05;
            await updateCustomerStoreCredit(
              order.customer_id,
              earnedCredit,
              `Earned 5% from order ${orderId}`,
            );

            console.log("Store credit awarded:", {
              orderId,
              customerId: order.customer_id,
              earnedCredit,
            });
          }
        }
      } catch (dbError) {
        console.error("Error updating order in Supabase:", dbError);
      }
    }

    // Return the payment response
    const paymentAmount = payment.amountMoney?.amount
      ? payment.amountMoney.amount / 100
      : 0;

    return res.status(201).json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: paymentAmount,
        currency: payment.amountMoney?.currency || "USD",
        receiptUrl: payment.receiptUrl || "",
        receiptNumber: payment.receiptNumber || "",
        cardDetails: {
          brand: payment.cardDetails?.card?.cardBrand || "",
          lastFour: payment.cardDetails?.card?.last4 || "",
          expMonth: payment.cardDetails?.card?.expMonth || null,
          expYear: payment.cardDetails?.card?.expYear || null,
        },
      },
    });
  } catch (error) {
    console.error("Create payment error - uncaught exception:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Payment creation failed";
    return res.status(500).json({
      success: false,
      error: errorMessage,
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Handle Square payment.updated webhook event
 */
async function handleSquarePaymentUpdated(data: any): Promise<void> {
  try {
    const { supabase } = await import("../utils/supabase");

    const payment = data?.object?.payment;
    if (!payment) {
      console.warn("No payment data in Square webhook");
      return;
    }

    const paymentId = payment.id;
    const orderIdRaw = payment.order_id;
    const paymentStatus = payment.status;
    const amountMoney = payment.amount_money || {};
    const cardDetails = payment.card_details || {};
    const card = cardDetails.card || {};

    if (!orderIdRaw) {
      console.warn("No order ID associated with payment:", paymentId);
      return;
    }

    const orderId = parseInt(orderIdRaw, 10);
    if (isNaN(orderId)) {
      console.warn("Invalid order ID format:", orderIdRaw);
      return;
    }

    console.log("Processing Square payment update:", {
      paymentId,
      orderId,
      status: paymentStatus,
      amount: amountMoney.amount,
    });

    // Only process completed or captured payments
    if (
      paymentStatus !== "COMPLETED" &&
      paymentStatus !== "APPROVED" &&
      cardDetails.status !== "CAPTURED"
    ) {
      console.log(`Payment status is ${paymentStatus}, skipping order update`);
      return;
    }

    // Get the current order to check if we need to award store credit
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, total, status, square_payment_details")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.warn(
        "Order not found in Supabase for payment:",
        orderId,
        orderError,
      );
      return;
    }

    // Check if this is the first time the payment is being marked as completed
    const previousPaymentDetails = order.square_payment_details || {};
    const wasAlreadyCompleted =
      previousPaymentDetails.payment_status === "COMPLETED" ||
      previousPaymentDetails.card_status === "CAPTURED";

    // Prepare updated payment details object
    const updatedPaymentDetails = {
      ...previousPaymentDetails,
      payment_id: paymentId,
      payment_status: paymentStatus,
      card_status: cardDetails.status || "",
      amount: amountMoney.amount ? amountMoney.amount / 100 : 0,
      currency: amountMoney.currency || "USD",
      payment_created_at: payment.created_at,
      payment_updated_at: payment.updated_at,
      card_brand: card.card_brand || "",
      card_last_4: card.last_4 || "",
      card_exp_month: card.exp_month || null,
      card_exp_year: card.exp_year || null,
      entry_method: cardDetails.entry_method || "",
      receipt_number: payment.receipt_number || "",
      receipt_url: payment.receipt_url || "",
      authorized_at: cardDetails.card_payment_timeline?.authorized_at || null,
      captured_at: cardDetails.card_payment_timeline?.captured_at || null,
    };

    // Update order with payment details
    const newStatus = paymentStatus === "COMPLETED" ? "paid" : order.status;
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        square_payment_details: updatedPaymentDetails,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order with payment details:", updateError);
      return;
    }

    console.log("Order updated with payment details:", orderId);

    // Award store credit only if this is the first time payment is completed
    if (
      !wasAlreadyCompleted &&
      order.customer_id &&
      (paymentStatus === "COMPLETED" || cardDetails.status === "CAPTURED")
    ) {
      const earnedCredit = order.total * 0.05;
      await updateCustomerStoreCredit(
        order.customer_id,
        earnedCredit,
        `Earned 5% from order ${orderId}`,
      );

      console.log("Store credit awarded for order:", {
        orderId,
        customerId: order.customer_id,
        earnedCredit,
      });
    } else if (wasAlreadyCompleted) {
      console.log(
        "Payment already completed, skipping duplicate store credit award:",
        orderId,
      );
    }
  } catch (error) {
    console.error("Error processing Square payment update:", error);
  }
}
