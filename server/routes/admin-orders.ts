import { RequestHandler } from "express";
import { supabase, getPendingOrders, getActiveOrders } from "../utils/supabase";
import { ecwidAPI } from "../utils/ecwid";

interface OrderItem {
  id?: number;
  quantity?: number;
  product_name?: string;
  options?: Record<string, any>;
  design_file_url?: string;
}

interface OrderWithCustomer {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  dateCreated: string;
  source: "ecwid" | "supabase";
  orderItems?: OrderItem[];
}

/**
 * Get all active orders from Supabase only (admin only)
 * Fetches orders with statuses: pending, processing, printing, in transit
 * Returns orders with customer details
 * Note: Only fetches from Supabase database, not from Ecwid
 */
export const handleGetAdminPendingOrders: RequestHandler = async (req, res) => {
  try {
    // Fetch active orders with specific statuses
    const pendingOrders = await getActiveOrders();

    if (!pendingOrders || pendingOrders.length === 0) {
      return res.json({
        success: true,
        orders: [],
        count: 0,
      });
    }

    // Format orders with customer details and order items
    const formattedOrders = pendingOrders.map((order: any) => ({
      id: order.id,
      customerId: order.customer_id,
      customerName:
        order.customers && Array.isArray(order.customers)
          ? `${order.customers[0]?.first_name || ""} ${order.customers[0]?.last_name || ""}`.trim()
          : order.customers
            ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim()
            : "Guest",
      customerEmail:
        order.customers && Array.isArray(order.customers)
          ? order.customers[0]?.email || "N/A"
          : order.customers?.email || "N/A",
      status: order.status,
      total: order.total || 0,
      dateCreated: order.created_at || new Date().toISOString(),
      source: "supabase" as const,
      orderItems: (order.order_items || []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product_name: item.product_name,
        options: item.options,
        design_file_url: item.design_file_url,
      })),
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Get admin pending orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};
