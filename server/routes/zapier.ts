import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Handle Zapier webhook from Ecwid
 * Receives order data from Zapier trigger and syncs to Supabase
 * SECURITY: Requires API key authentication
 */
export const handleZapierEcwidWebhook: RequestHandler = async (req, res) => {
  try {
    // SECURITY: Verify API key
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.ZAPIER_WEBHOOK_API_KEY;
    
    if (!expectedKey) {
      console.error("[SECURITY] ZAPIER_WEBHOOK_API_KEY not configured");
      return res.status(503).json({ error: "Webhook not configured" });
    }
    
    if (!apiKey || apiKey !== expectedKey) {
      console.warn("[SECURITY] Invalid Zapier webhook API key attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const zapierData = req.body;

    console.log("Zapier webhook received from Ecwid:", {
      orderId: zapierData.order_id || zapierData.id,
      customerEmail: zapierData.customer_email || zapierData.email,
      total: zapierData.order_total || zapierData.total,
    });

    // Extract order data from Zapier payload
    const ecwidOrderId = zapierData.order_id || zapierData.id;
    const ecwidCustomerId = zapierData.customer_id || zapierData.customer?.id;

    if (!ecwidOrderId) {
      return res.status(400).json({ 
        error: "Missing order_id in Zapier payload" 
      });
    }

    // Check if order already exists in Supabase
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("ecwid_order_id", ecwidOrderId)
      .single();

    if (existingOrder) {
      console.log("Order already exists in Supabase:", existingOrder.id);
      return res.json({ 
        success: true, 
        message: "Order already exists",
        orderId: existingOrder.id 
      });
    }

    // Find or get customer
    let customerId: string | null = null;
    if (ecwidCustomerId) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("ecwid_customer_id", ecwidCustomerId)
        .single();

      customerId = customer?.id || null;
    }

    // Prepare order data
    const orderData = {
      customer_id: customerId,
      status: "processing", // Default to processing for new orders from Zapier
      total: zapierData.order_total || zapierData.total || 0,
      subtotal: zapierData.order_subtotal || zapierData.subtotal || 0,
      tax: zapierData.order_tax || zapierData.tax || 0,
      shipping: zapierData.order_shipping || zapierData.shipping || 0,
      billing_address: zapierData.billing_address || {
        name: zapierData.billing_name,
        email: zapierData.billing_email,
        phone: zapierData.billing_phone,
        address: zapierData.billing_address_1,
        city: zapierData.billing_city,
        state: zapierData.billing_state,
        postal_code: zapierData.billing_postal_code,
        country: zapierData.billing_country,
      },
      shipping_address: zapierData.shipping_address || {
        name: zapierData.shipping_name,
        email: zapierData.shipping_email,
        phone: zapierData.shipping_phone,
        address: zapierData.shipping_address_1,
        city: zapierData.shipping_city,
        state: zapierData.shipping_state,
        postal_code: zapierData.shipping_postal_code,
        country: zapierData.shipping_country,
      },
      ecwid_order_id: ecwidOrderId,
      ecwid_customer_id: ecwidCustomerId || null,
      items: zapierData.items || [],
      created_at: zapierData.created_date || zapierData.date_created || new Date().toISOString(),
      estimated_delivery_date: zapierData.estimated_delivery_date || null,
      tracking_number: zapierData.tracking_number || null,
      tracking_carrier: zapierData.tracking_carrier || null,
      tracking_url: zapierData.tracking_url || null,
      source: "zapier",
    };

    // Create order in Supabase
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order in Supabase:", orderError);
      return res.status(500).json({ 
        error: "Failed to create order",
        details: orderError.message 
      });
    }

    console.log("Order successfully created from Zapier:", newOrder.id);

    // Also sync customer if provided
    if (ecwidCustomerId) {
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("ecwid_customer_id", ecwidCustomerId)
        .single();

      if (!existingCustomer) {
        const customerData = {
          email: zapierData.customer_email || zapierData.email,
          ecwid_customer_id: ecwidCustomerId,
          name: zapierData.customer_name || zapierData.name || "",
          phone: zapierData.phone || "",
        };

        const { error: customerError } = await supabase
          .from("customers")
          .insert([customerData]);

        if (customerError) {
          console.warn("Error creating customer from Zapier:", customerError);
          // Don't fail the request if customer sync fails - order is already created
        }
      }
    }

    res.json({
      success: true,
      message: "Order synced from Zapier to Supabase",
      orderId: newOrder.id,
      ecwidOrderId: ecwidOrderId,
    });

  } catch (error) {
    console.error("Zapier webhook error:", error);
    res.status(500).json({
      error: "Failed to process Zapier webhook",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Health check endpoint for Zapier integration
 */
export const handleZapierHealth: RequestHandler = (req, res) => {
  res.json({
    status: "healthy",
    service: "zapier-ecwid-integration",
    endpoint: "/api/zapier/webhook",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get Zapier webhook URL for setup instructions
 */
export const handleGetZapierWebhookUrl: RequestHandler = (req, res) => {
  const host = req.get("host") || "your-domain.com";
  const protocol = req.header("x-forwarded-proto") || req.protocol || "https";
  const zapierWebhookUrl = `${protocol}://${host}/api/zapier/webhook`;

  res.json({
    webhookUrl: zapierWebhookUrl,
    instructions: {
      step1: "In Zapier, create a new Zap with Ecwid as trigger",
      step2: "Choose 'New Order' or 'Updated Order' event",
      step3: "For the action, select 'Webhooks by Zapier' → 'POST'",
      step4: "Paste this URL into the webhook URL field",
      step5: "Map the following Ecwid fields to the webhook body:",
      fieldMappings: {
        order_id: "Use Ecwid's Order ID field",
        customer_id: "Use Ecwid's Customer ID field",
        customer_email: "Use Ecwid's Customer Email field",
        order_total: "Use Ecwid's Order Total field",
        order_subtotal: "Use Ecwid's Order Subtotal field",
        order_tax: "Use Ecwid's Tax field",
        order_shipping: "Use Ecwid's Shipping Cost field",
        items: "Use Ecwid's Order Items field",
        created_date: "Use Ecwid's Date Created field",
      },
      step6: "Save and test your Zap",
    },
  });
};
