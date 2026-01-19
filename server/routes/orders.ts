import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import {
  getCustomerOrders,
  getOrderById,
  getPendingOrders,
} from "../utils/supabase";
import { ecwidAPI } from "../utils/ecwid";
import { bigCommerceAPI } from "../utils/bigcommerce";
import { parseOrderNumber } from "../utils/order";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Get customer's orders from Ecwid
 * Requires: customerId in JWT token
 */
export const handleGetOrders: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Fetching orders for customer:", customerId);

    // Fetch orders from Ecwid
    let ecwidOrders = [];
    try {
      ecwidOrders = await ecwidAPI.getCustomerOrders(customerId);
    } catch (ecwidError) {
      console.warn("Failed to fetch orders from Ecwid:", ecwidError);
      // Continue without Ecwid orders if API fails
    }

    // Fetch orders from BigCommerce
    let bigCommerceOrders = [];
    try {
      bigCommerceOrders = await bigCommerceAPI.getCustomerOrders(customerId);
    } catch (bcError) {
      console.warn("Failed to fetch orders from BigCommerce:", bcError);
      // Continue without BigCommerce orders if API fails
    }

    // Fetch from Supabase for local orders
    let supabaseOrders = [];
    try {
      supabaseOrders = await getCustomerOrders(customerId);
    } catch (supabaseError) {
      console.warn("Failed to fetch orders from Supabase:", supabaseError);
    }

    // Fetch digital files for Ecwid orders from Supabase
    let ecwidDigitalFilesMap = new Map();
    if (ecwidOrders.length > 0) {
      try {
        const { data: digitalFilesData } = await supabase
          .from("digital_files")
          .select("*")
          .in(
            "order_id",
            ecwidOrders.map((o: any) => o.id),
          );

        if (digitalFilesData) {
          digitalFilesData.forEach((file: any) => {
            if (!ecwidDigitalFilesMap.has(file.order_id)) {
              ecwidDigitalFilesMap.set(file.order_id, []);
            }
            ecwidDigitalFilesMap.get(file.order_id).push({
              id: file.id,
              file_name: file.file_name,
              file_url: file.file_url,
              file_type: file.file_type,
              file_size: file.file_size,
              uploaded_at: file.uploaded_at,
            });
          });
        }
      } catch (filesError) {
        console.warn("Failed to fetch digital files for Ecwid orders:", filesError);
      }
    }

    // Format Ecwid orders with tracking and design file info
    const formattedEcwidOrders = ecwidOrders.map((order: any) => ({
      id: order.id,
      customerId: order.customerId,
      status: order.status || order.fulfillmentStatus || order.paymentStatus || "processing",
      total: order.total,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      shipping: order.shippingCost || 0,
      dateCreated: order.createDate,
      source: "ecwid",
      itemCount: order.items?.length || 0,
      items: order.items || [],
      tracking_number: order.shippingTrackingCode,
      tracking_carrier: order.shippingCarrier,
      tracking_url: order.trackingUrl,
      shipped_date: order.shippingDate,
      estimated_delivery_date: order.estimatedDeliveryDate,
      digital_files: ecwidDigitalFilesMap.get(order.id) || [],
      shippingAddress: order.shippingPerson,
      customerName: order.customerName,
      customerEmail: order.email,
      customerPhone: order.customerPhone,
    }));

    // Format BigCommerce orders
    const formattedBigCommerceOrders = bigCommerceOrders.map((order: any) => ({
      id: order.id,
      customerId: order.customer_id,
      status: order.status || "pending",
      total: order.total,
      subtotal: order.subtotal_ex_tax,
      tax: order.total_tax,
      shipping: order.total_shipping || 0,
      dateCreated: order.date_created,
      source: "bigcommerce",
      itemCount: order.line_items?.length || 0,
      items: order.line_items || [],
      tracking_number: order.shipments?.[0]?.tracking_number,
      tracking_carrier: order.shipments?.[0]?.shipping_provider,
      shipped_date: order.shipments?.[0]?.date_flag_list?.shipped_on,
      shippingAddress: order.shipping_addresses?.[0],
      customerName: `${order.billing_address?.first_name || ""} ${order.billing_address?.last_name || ""}`.trim(),
      customerEmail: order.customer_email,
      customerPhone: order.billing_address?.phone,
      digital_files: [],
    }));

    // Fetch digital files for all orders
    const { data: digitalFilesData } = await supabase
      .from("digital_files")
      .select("*")
      .in(
        "order_id",
        supabaseOrders.map((o: any) => o.id),
      );

    const filesMap = new Map();
    if (digitalFilesData) {
      digitalFilesData.forEach((file: any) => {
        if (!filesMap.has(file.order_id)) {
          filesMap.set(file.order_id, []);
        }
        filesMap.get(file.order_id).push({
          id: file.id,
          file_name: file.file_name,
          file_url: file.file_url,
          file_type: file.file_type,
          file_size: file.file_size,
          uploaded_at: file.uploaded_at,
        });
      });
    }

    // Format Supabase orders with digital files and customer info
    const formattedSupabaseOrders = supabaseOrders.map((order: any) => {
      // Fetch customer info for this order
      const customerInfo = order.customers || {};

      return {
        id: order.id,
        customerId: order.customer_id,
        status: order.status || "paid",
        total: order.total,
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        dateCreated: order.created_at,
        source: "supabase",
        itemCount: order.order_items?.length || 0,
        items: order.order_items || [],
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        digital_files: filesMap.get(order.id) || [],
        shippingAddress: order.shipping_address,
        customerName: `${customerInfo.first_name || ""} ${customerInfo.last_name || ""}`.trim(),
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
      };
    });

    // Combine and sort by date
    const allOrders = [
      ...formattedEcwidOrders,
      ...formattedBigCommerceOrders,
      ...formattedSupabaseOrders,
    ].sort(
      (a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    );

    console.log(
      "Fetched",
      allOrders.length,
      "orders (Ecwid +",
      bigCommerceOrders.length,
      "BigCommerce + Supabase)",
    );

    res.json({
      success: true,
      orders: allOrders,
      count: allOrders.length,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get single order details from Ecwid or Supabase
 * Requires: customerId in JWT token, orderId in params
 */
export const handleGetOrder: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { orderId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    const orderIdNum = parseInt(orderId);
    let order = null;

    // Try Ecwid first
    try {
      order = await ecwidAPI.getOrder(orderIdNum);
      if (order && order.customerId === customerId) {
        // Fetch digital files for this Ecwid order
        let digitalFiles = [];
        try {
          const { data: digitalFilesData } = await supabase
            .from("digital_files")
            .select("*")
            .eq("order_id", orderIdNum);

          if (digitalFilesData) {
            digitalFiles = digitalFilesData.map((file: any) => ({
              id: file.id,
              file_name: file.file_name,
              file_url: file.file_url,
              file_type: file.file_type,
              file_size: file.file_size,
              uploaded_at: file.uploaded_at,
            }));
          }
        } catch (filesError) {
          console.warn("Failed to fetch digital files for Ecwid order:", filesError);
        }

        return res.json({
          success: true,
          source: "ecwid",
          order: {
            id: order.id,
            customerId: order.customerId,
            status:
              order.fulfillmentStatus || order.paymentStatus || "processing",
            dateCreated: order.createDate,
            total: order.total,
            subtotal: order.subtotal || 0,
            tax: order.tax || 0,
            shipping: order.shippingCost || 0,
            items: order.items || [],
            shippingAddress: order.shippingPerson,
            billingAddress: order.billingPerson,
            tracking_number: order.shippingTrackingCode,
            tracking_carrier: order.shippingCarrier,
            estimated_delivery_date: order.estimatedDeliveryDate,
            digital_files: digitalFiles,
          },
        });
      }
    } catch (ecwidError) {
      console.warn("Failed to fetch order from Ecwid:", ecwidError);
    }

    // Fallback to Supabase
    order = await getOrderById(orderIdNum, customerId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Fetch digital files for this order
    const { data: digitalFilesData } = await supabase
      .from("digital_files")
      .select("*")
      .eq("order_id", order.id);

    const digitalFiles = (digitalFilesData || []).map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type,
      file_size: file.file_size,
      uploaded_at: file.uploaded_at,
    }));

    res.json({
      success: true,
      source: "supabase",
      order: {
        id: order.id,
        customerId: order.customer_id,
        status: order.status,
        dateCreated: order.created_at,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        items: order.order_items || [],
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        digital_files: digitalFiles,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * Create a new order in Supabase
 * Requires: customerId in JWT token
 * Note: Most orders are created via the /api/checkout endpoint
 */
export const handleCreateOrder: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { items, shippingAddress, billingAddress, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items required" });
    }

    if (!shippingAddress || !billingAddress) {
      return res
        .status(400)
        .json({ error: "Shipping and billing addresses required" });
    }

    // This endpoint is primarily for API use; checkout is the main flow
    res.status(501).json({
      error: "Use /api/checkout endpoint to create orders",
    });
  } catch (error) {
    console.error("Create order error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create order";
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Get order by ID (admin/internal use)
 * Protected by verifyToken middleware
 * Note: In a real implementation, verify admin role before granting access
 */
export const handleAdminGetOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    // TODO: Add admin role verification
    res.status(501).json({
      error: "Admin order retrieval endpoint coming soon",
    });
  } catch (error) {
    console.error("Admin get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * Get all pending orders (admin use)
 * Protected by verifyToken middleware
 */
export const handleGetPendingOrders: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pendingOrders = await getPendingOrders();

    const formattedOrders = pendingOrders.map((order) => ({
      id: order.id,
      customerId: order.customer_id,
      customerName: order.customers
        ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim()
        : "Unknown",
      customerEmail: order.customers?.email || "N/A",
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      dateCreated: order.created_at,
      itemCount: 0,
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Get pending orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch pending orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get order by ID for public access (guest orders after checkout)
 * No authentication required - used for order confirmation after payment
 */
export const handleGetOrderPublic: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    const orderIdNum = parseInt(orderId);
    if (isNaN(orderIdNum)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const { supabase } = await import("../utils/supabase");

    // Get the order from Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        customer_id,
        status,
        created_at,
        total,
        subtotal,
        tax,
        shipping,
        shipping_address,
        billing_address,
        estimated_delivery_date,
        tracking_number,
        tracking_carrier,
        tracking_url,
        shipped_date,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `)
      .eq("id", orderIdNum)
      .single();

    if (orderError || !order) {
      console.warn("Order not found for public access:", orderIdNum);
      return res.status(404).json({ error: "Order not found" });
    }

    // Fetch digital files if any exist
    const { data: digitalFilesData } = await supabase
      .from("digital_files")
      .select("*")
      .eq("order_id", orderId);

    const digitalFiles = (digitalFilesData || []).map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type,
      file_size: file.file_size,
      uploaded_at: file.uploaded_at,
    }));

    res.json({
      success: true,
      data: {
        id: order.id,
        customer_id: order.customer_id,
        status: order.status,
        date_created: order.created_at,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        products: (order.order_items || []).map((item: any) => ({
          ...item,
          name: item.product_name,
        })),
        shipping_addresses: order.shipping_address
          ? [order.shipping_address]
          : [],
        billing_address: order.billing_address,
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        digital_files: digitalFiles,
      },
    });
  } catch (error) {
    console.error("Get order public error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch order";
    res.status(500).json({ error: errorMsg });
  }
};

/**
 * Look up order by order number and email for public order status page
 * No authentication required - customers use order number and email to check status
 */
export const handleGetOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { orderNumber } = req.query;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        error: "Order number is required",
      });
    }

    // Parse order number - accepts both SY-5XXXXX format and plain numeric format
    let orderIdNum: number;
    try {
      orderIdNum = parseOrderNumber(orderNumber as string);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: "Invalid order number format",
      });
    }

    const { supabase } = await import("../utils/supabase");

    // Get the order from Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        customer_id,
        status,
        created_at,
        total,
        subtotal,
        tax,
        shipping,
        shipping_address,
        billing_address,
        order_items (
          id,
          product_id,
          quantity,
          price,
          options,
          design_file_url
        )
      `)
      .eq("id", orderIdNum)
      .single();

    if (orderError || !order) {
      console.warn("Order not found in Supabase:", orderIdNum, "Error:", orderError);
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    console.log("Order found:", { id: order.id, customer_id: order.customer_id });

    // Fetch customer info for display
    let customerEmail = "";
    let customerName = "";

    if (order.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("email, name")
        .eq("id", order.customer_id)
        .single();

      if (customer) {
        customerEmail = customer.email || "";
        customerName = customer.name || "";
        console.log("Customer found:", { email: customerEmail, name: customerName });
      }
    }

    // Enrich order items with product details
    const enrichedItems = await Promise.all(
      (order.order_items || []).map(async (item: any) => {
        let productName = `Product #${item.product_id}`;
        let productSku = "";
        let productDescription = "";

        if (item.product_id) {
          try {
            // Handle both numeric and string IDs (e.g., "admin_11" or 11)
            let queryId = item.product_id;
            if (typeof queryId === "string" && queryId.includes("admin_")) {
              // Extract numeric part from "admin_11" -> 11
              const numericPart = queryId.replace("admin_", "");
              queryId = parseInt(numericPart, 10);
            }

            console.log(`Fetching product with ID: ${queryId} (original: ${item.product_id})`);

            const { data: product, error: productError } = await supabase
              .from("admin_products")
              .select("name, sku, description")
              .eq("id", queryId)
              .single();

            if (product && product.name) {
              productName = product.name;
              productSku = product.sku || "";
              productDescription = product.description || "";
              console.log(`Product found: ${productName}`);
            } else if (productError) {
              console.warn(`Failed to fetch product ${queryId}:`, productError);
            }
          } catch (err) {
            console.warn(`Error fetching product ${item.product_id}:`, err);
          }
        }

        return {
          ...item,
          product_name: productName,
          product_sku: productSku,
          product_description: productDescription,
          options: item.options || null,
          design_file_url: item.design_file_url || null,
          line_total: (item.price || 0) * (item.quantity || 0),
        };
      })
    );

    // Fetch digital files if any exist
    const { data: digitalFilesData } = await supabase
      .from("digital_files")
      .select("*")
      .eq("order_id", orderIdNum);

    const digitalFiles = (digitalFilesData || []).map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type,
      file_size: file.file_size,
      uploaded_at: file.uploaded_at,
    }));

    res.json({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        dateCreated: order.created_at,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        customerName: customerName || "",
        customerEmail: customerEmail,
        products: enrichedItems,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        digitalFiles: digitalFiles,
      },
    });
  } catch (error) {
    console.error("Get order status error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch order status";
    res.status(500).json({
      success: false,
      error: errorMsg,
    });
  }
};
