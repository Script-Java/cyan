import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import {
  getCustomerOrders,
  getOrderById,
  getPendingOrders,
} from "../utils/supabase";
import { ecwidAPI } from "../utils/ecwid";
import { bigCommerceAPI } from "../utils/bigcommerce";

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
      dateCreated: order.createDate,
      source: "ecwid",
      itemCount: order.items?.length || 0,
      tracking_number: order.shippingTrackingCode,
      tracking_carrier: order.shippingCarrier,
      estimated_delivery_date: order.estimatedDeliveryDate,
      digital_files: ecwidDigitalFilesMap.get(order.id) || [],
    }));

    // Format BigCommerce orders
    const formattedBigCommerceOrders = bigCommerceOrders.map((order: any) => ({
      id: order.id,
      customerId: order.customer_id,
      status: order.status || "pending",
      total: order.total,
      dateCreated: order.date_created,
      source: "bigcommerce",
      itemCount: order.line_items?.length || 0,
      subtotal: order.subtotal_ex_tax,
      tax: order.total_tax,
      shipping: order.total_shipping,
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

    // Format Supabase orders with digital files
    const formattedSupabaseOrders = supabaseOrders.map((order: any) => ({
      id: order.id,
      customerId: order.customer_id,
      status: order.status || "paid",
      total: order.total,
      dateCreated: order.created_at,
      source: "supabase",
      itemCount: order.order_items?.length || 0,
      estimated_delivery_date: order.estimated_delivery_date,
      tracking_number: order.tracking_number,
      tracking_carrier: order.tracking_carrier,
      tracking_url: order.tracking_url,
      shipped_date: order.shipped_date,
      digital_files: filesMap.get(order.id) || [],
    }));

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
