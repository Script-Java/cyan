import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Map Ecwid fulfillment status to internal order status
 */
function mapEcwidStatusToOrderStatus(fulfillmentStatus: string | undefined, paymentStatus: string | undefined): string {
  const statusMap: Record<string, string> = {
    "AWAITING_PAYMENT": "pending",
    "PAID": "processing",
    "PROCESSING": "processing",
    "SHIPPED": "completed",
    "DELIVERED": "completed",
    "CANCELLED": "cancelled",
  };

  const ecwidStatus = fulfillmentStatus || paymentStatus || "PROCESSING";
  return statusMap[ecwidStatus] || "pending";
}

/**
 * Verify Ecwid webhook signature
 * Ecwid sends an X-Ecwid-Webhook-Signature header
 */
function verifyEcwidSignature(body: string, signature: string): boolean {
  const secret = process.env.ECWID_API_TOKEN || "";

  // Create HMAC SHA256 hash
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");

  // Compare signatures
  return hash === signature;
}

/**
 * Handle Ecwid order.completed webhook
 * Sync order data to Supabase
 */
export const handleEcwidOrderWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers["x-ecwid-webhook-signature"] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyEcwidSignature(body, signature)) {
      console.warn("Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;
    console.log("Ecwid webhook received:", {
      eventType: event.eventType,
      orderId: event.data?.orderId,
      customerId: event.data?.customerId,
    });

    // Handle different event types
    switch (event.eventType) {
      case "order.completed":
        await handleOrderCompleted(event.data);
        break;
      case "order.updated":
        await handleOrderUpdated(event.data);
        break;
      case "customer.created":
        await handleCustomerCreated(event.data);
        break;
      case "customer.updated":
        await handleCustomerUpdated(event.data);
        break;
      default:
        console.log("Unhandled event type:", event.eventType);
    }

    // Always return success to Ecwid
    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent Ecwid from retrying
    res.status(200).json({ error: "Webhook processed with errors" });
  }
};

/**
 * Handle order completion
 */
async function handleOrderCompleted(data: any): Promise<void> {
  try {
    console.log(
      "Processing Ecwid order completion:",
      data.orderId,
      "Customer:",
      data.customerId,
    );

    // Check if order exists in Supabase by Ecwid order ID
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("ecwid_order_id", data.orderId)
      .single();

    if (existingOrder) {
      // Don't overwrite status on order.completed if order already exists
      // Just update the timestamp to mark as processed
      await supabase
        .from("orders")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingOrder.id);

      console.log("Ecwid order already exists in Supabase:", existingOrder.id);
    } else {
      // Find customer by Ecwid customer ID
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("ecwid_customer_id", data.customerId)
        .single();

      // Create new order record - use Ecwid's fulfillment status if available
      const orderStatus = mapEcwidStatusToOrderStatus(data.fulfillmentStatus, data.paymentStatus);

      const orderData = {
        customer_id: customer?.id || null,
        status: orderStatus,
        total: data.total || 0,
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        shipping: data.shipping || 0,
        billing_address: data.billingPerson,
        shipping_address: data.shippingPerson,
        ecwid_order_id: data.orderId,
        ecwid_customer_id: data.customerId,
        items: data.items || [],
        created_at: data.createDate || new Date().toISOString(),
        estimated_delivery_date: data.estimatedDeliveryDate || null,
        tracking_number: data.trackingNumber || null,
        tracking_carrier: data.trackingCarrier || null,
        tracking_url: data.trackingUrl || null,
      };

      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (!error && newOrder) {
        console.log("Ecwid order created in Supabase:", newOrder.id);
      } else if (error) {
        console.error("Error creating order in Supabase:", error);
      }
    }
  } catch (error) {
    console.error("Error processing order completion:", error);
  }
}

/**
 * Handle order update
 */
async function handleOrderUpdated(data: any): Promise<void> {
  try {
    console.log("Processing Ecwid order update:", data.orderId);

    const updateData: any = {
      status: data.fulfillmentStatus || data.paymentStatus || "processing",
      updated_at: new Date().toISOString(),
    };

    // Update estimated delivery date if provided
    if (data.estimatedDeliveryDate) {
      updateData.estimated_delivery_date = data.estimatedDeliveryDate;
    }

    // Update tracking information if provided
    if (data.trackingNumber) {
      updateData.tracking_number = data.trackingNumber;
      updateData.tracking_carrier = data.trackingCarrier || null;
      updateData.tracking_url = data.trackingUrl || null;
      updateData.shipped_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("ecwid_order_id", data.orderId);

    if (!error) {
      console.log("Ecwid order updated in Supabase:", data.orderId);
    } else {
      console.error("Error updating order in Supabase:", error);
    }
  } catch (error) {
    console.error("Error processing order update:", error);
  }
}

/**
 * Handle customer creation
 */
async function handleCustomerCreated(data: any): Promise<void> {
  try {
    console.log(
      "Processing customer creation from Ecwid:",
      data.id,
      data.email,
    );

    // Check if customer exists by Ecwid ID
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id, ecwid_customer_id")
      .eq("ecwid_customer_id", data.id)
      .single();

    if (!existingCustomer) {
      // Create customer in Supabase with Ecwid customer ID
      const { data: newCustomer, error } = await supabase
        .from("customers")
        .insert({
          email: data.email,
          first_name: data.firstName || "",
          last_name: data.lastName || "",
          phone: data.phone || "",
          company: data.companyName || "",
          store_credit: 0,
          ecwid_customer_id: data.id,
          // Customer will set password when they first log in
          password_hash: null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating customer in Supabase:", error);
      } else {
        console.log("Ecwid customer synced to Supabase:", newCustomer.id);
      }
    } else {
      console.log(
        "Ecwid customer already exists in Supabase:",
        existingCustomer.id,
      );
    }
  } catch (error) {
    console.error("Error processing customer creation:", error);
  }
}

/**
 * Handle customer update
 */
async function handleCustomerUpdated(data: any): Promise<void> {
  try {
    console.log("Processing customer update from Ecwid:", data.id);

    // Find customer by Ecwid ID
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("ecwid_customer_id", data.id)
      .single();

    if (existingCustomer) {
      await supabase
        .from("customers")
        .update({
          email: data.email,
          first_name: data.firstName || "",
          last_name: data.lastName || "",
          phone: data.phone || "",
          company: data.companyName || "",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id);

      console.log("Ecwid customer updated in Supabase:", existingCustomer.id);
    } else {
      // Customer doesn't exist, create them
      await handleCustomerCreated(data);
    }
  } catch (error) {
    console.error("Error processing customer update:", error);
  }
}

/**
 * Get webhook URL - for easy reference when setting up Ecwid webhooks
 */
export const handleGetWebhookUrl: RequestHandler = (req, res) => {
  const host = req.get("host") || "your-domain.com";
  const protocol = req.header("x-forwarded-proto") || req.protocol || "https";
  const webhookUrl = `${protocol}://${host}/api/webhooks/ecwid`;

  res.json({
    webhookUrl,
    instructions: "Paste this URL into your Ecwid admin panel under Settings → Integration → Webhooks",
    events: ["order.completed", "order.updated", "customer.created", "customer.updated"],
  });
};

/**
 * Health check for webhooks
 */
export const handleWebhookHealth: RequestHandler = (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Diagnostic endpoint to verify Ecwid API connectivity and webhook configuration
 */
export const handleEcwidDiagnostic: RequestHandler = async (req, res) => {
  try {
    const ECWID_API_TOKEN = process.env.ECWID_API_TOKEN || "";
    const ECWID_STORE_ID = process.env.ECWID_STORE_ID || "";

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      configStatus: {
        hasApiToken: !!ECWID_API_TOKEN,
        hasStoreId: !!ECWID_STORE_ID,
        storeId: ECWID_STORE_ID,
      },
      apiConnectivity: {
        status: "unknown",
        message: "",
      },
      webhookUrl: `${req.header("x-forwarded-proto") || req.protocol || "https"}://${req.get("host") || "your-domain.com"}/api/webhooks/ecwid`,
      webhookSetupInstructions: {
        step1: "Log in to your Ecwid admin panel",
        step2: "Go to Settings → Integration → Webhooks (or Settings → API → Webhooks)",
        step3: "Add a new webhook with the URL above",
        step4: "Select events: order.completed, order.updated, customer.created, customer.updated",
        step5: "Save and test the webhook",
      },
      supabaseConnection: {
        status: "unknown",
        message: "",
      },
      recentOrders: {
        count: 0,
        lastOrder: null,
      },
    };

    // Check API connectivity
    if (!ECWID_API_TOKEN || !ECWID_STORE_ID) {
      diagnostics.apiConnectivity.status = "error";
      diagnostics.apiConnectivity.message =
        "Missing ECWID_API_TOKEN or ECWID_STORE_ID environment variables";
    } else {
      try {
        // Try to fetch a single order to verify connectivity
        const response = await fetch(
          `https://api.ecwid.com/api/v3/${ECWID_STORE_ID}/orders?limit=1&token=${ECWID_API_TOKEN}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          diagnostics.apiConnectivity.status = "connected";
          diagnostics.apiConnectivity.message =
            "Successfully connected to Ecwid API";
          diagnostics.recentOrders.count = data.total || 0;

          if (data.items && data.items.length > 0) {
            diagnostics.recentOrders.lastOrder = {
              id: data.items[0].id,
              number: data.items[0].number,
              createdDate: data.items[0].createdDate,
              status: data.items[0].status,
            };
          }
        } else {
          diagnostics.apiConnectivity.status = "error";
          diagnostics.apiConnectivity.message = `Ecwid API returned ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        diagnostics.apiConnectivity.status = "error";
        diagnostics.apiConnectivity.message = `Network error: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    }

    // Check Supabase connection and recent webhooks
    try {
      const { data: recentWebhooks, error } = await supabase
        .from("orders")
        .select("id, ecwid_order_id, created_at, status")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error) {
        diagnostics.supabaseConnection.status = "connected";
        diagnostics.supabaseConnection.message =
          "Successfully connected to Supabase";
      } else {
        diagnostics.supabaseConnection.status = "error";
        diagnostics.supabaseConnection.message = `Supabase error: ${error.message}`;
      }
    } catch (error) {
      diagnostics.supabaseConnection.status = "error";
      diagnostics.supabaseConnection.message = `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    res.json(diagnostics);
  } catch (error) {
    console.error("Diagnostic error:", error);
    res.status(500).json({
      error: "Failed to run diagnostics",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Test webhook endpoint - for testing webhook payload handling without requiring Ecwid to send real data
 * This is useful for development and debugging
 */
export const handleTestWebhook: RequestHandler = async (req, res) => {
  try {
    const testPayload = req.body;

    // Add test signature for validation (we'll skip verification for test endpoint)
    console.log("Test webhook payload received:", testPayload);

    // Process based on event type
    if (testPayload.eventType === "order.completed") {
      await handleOrderCompleted(testPayload.data);
      res.json({
        success: true,
        message: "Test order webhook processed",
        eventType: "order.completed",
      });
    } else if (testPayload.eventType === "customer.created") {
      await handleCustomerCreated(testPayload.data);
      res.json({
        success: true,
        message: "Test customer webhook processed",
        eventType: "customer.created",
      });
    } else {
      res.json({
        success: true,
        message: "Test webhook received and logged",
        eventType: testPayload.eventType || "unknown",
      });
    }
  } catch (error) {
    console.error("Test webhook error:", error);
    res.status(500).json({
      error: "Failed to process test webhook",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
