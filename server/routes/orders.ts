import { RequestHandler } from "express";
import { bigCommerceAPI } from "../utils/bigcommerce";

/**
 * Get customer's orders
 * Requires: customerId in JWT token
 */
export const handleGetOrders: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orders = await bigCommerceAPI.getCustomerOrders(customerId);

    res.json({
      success: true,
      orders: orders.map((order: any) => ({
        id: order.id,
        customerId: order.customer_id,
        status: order.status,
        dateCreated: order.date_created,
        total: order.total_incl_tax,
        itemCount: order.items_count,
      })),
      count: orders.length,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get single order details
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

    const order = await bigCommerceAPI.getOrder(parseInt(orderId));

    // Verify order belongs to customer
    if (order.customer_id !== customerId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        customerId: order.customer_id,
        status: order.status,
        dateCreated: order.date_created,
        total: order.total_incl_tax,
        subtotal: order.subtotal_ex_tax,
        tax: order.total_tax,
        items: order.items || [],
        shippingAddress: order.shipping_addresses?.[0],
        billingAddress: order.billing_address,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * Create a new order
 * Requires: customerId in JWT token
 */
export const handleCreateOrder: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { items, shippingAddress, billingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items required" });
    }

    // Build order payload
    const orderPayload = {
      customer_id: customerId,
      line_items: items.map((item: any) => ({
        product_id: item.productId,
        quantity: item.quantity,
        custom_fields: item.customFields || [],
      })),
      shipping_addresses: shippingAddress ? [shippingAddress] : undefined,
      billing_address: billingAddress,
    };

    const newOrder = await bigCommerceAPI.createOrder(orderPayload);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: newOrder.id,
        customerId: newOrder.customer_id,
        status: newOrder.status,
        total: newOrder.total_incl_tax,
        dateCreated: newOrder.date_created,
      },
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
 */
export const handleAdminGetOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    const order = await bigCommerceAPI.getOrder(parseInt(orderId));

    res.json({
      success: true,
      order: {
        id: order.id,
        customerId: order.customer_id,
        status: order.status,
        dateCreated: order.date_created,
        total: order.total_incl_tax,
        items: order.items || [],
      },
    });
  } catch (error) {
    console.error("Admin get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
