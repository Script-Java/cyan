import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

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
    console.log("Processing order completion:", data.orderId);

    // Check if order exists in Supabase
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("bigcommerce_order_id", data.orderId)
      .single();

    if (existingOrder) {
      // Update status
      await supabase
        .from("orders")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", existingOrder.id);

      console.log("Order updated in Supabase:", existingOrder.id);
    } else {
      // Create new order record
      const orderData = {
        customer_id: data.customerId,
        status: "completed",
        total: data.total || 0,
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        shipping: data.shipping || 0,
        billing_address: data.billingPerson,
        shipping_address: data.shippingPerson,
        bigcommerce_order_id: data.orderId,
        items: data.items || [],
      };

      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (!error && newOrder) {
        console.log("Order created in Supabase:", newOrder.id);
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
    console.log("Processing order update:", data.orderId);

    const { error } = await supabase
      .from("orders")
      .update({
        status: data.fulfillmentStatus || data.paymentStatus || "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("bigcommerce_order_id", data.orderId);

    if (!error) {
      console.log("Order updated in Supabase:", data.orderId);
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
    console.log("Processing customer creation from Ecwid:", data.id, data.email);

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
      console.log("Ecwid customer already exists in Supabase:", existingCustomer.id);
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
    console.log("Processing customer update:", data.id);

    await supabase
      .from("customers")
      .update({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        company: data.companyName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    console.log("Customer updated in Supabase:", data.id);
  } catch (error) {
    console.error("Error processing customer update:", error);
  }
}

/**
 * Health check for webhooks
 */
export const handleWebhookHealth: RequestHandler = (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};
