import { RequestHandler } from "express";
import {
  getCustomerOrders,
  getOrderById,
  getPendingOrders,
} from "../utils/supabase";

/**
 * Get customer's orders from Supabase
 * Requires: customerId in JWT token
 */
export const handleGetOrders: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Fetching orders from Supabase for customer:", customerId);
    const orders = await getCustomerOrders(customerId);

    // Format Supabase orders to match expected format
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customerId: order.customer_id,
      status: order.status || "paid",
      total: order.total,
      dateCreated: order.created_at,
      itemCount: order.order_items?.length || 0,
    }));

    console.log("Fetched", formattedOrders.length, "orders from Supabase");

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get single order details from Supabase
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

    const order = await getOrderById(parseInt(orderId), customerId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
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
