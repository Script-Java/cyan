import { RequestHandler } from "express";
import { supabase, getPendingOrders } from "../utils/supabase";
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
 * Get all pending orders from Supabase only (admin only)
 * Uses the same getPendingOrders function as OrderHistory
 * Returns orders that have status="pending" with customer details
 * Note: Only fetches from Supabase database, not from Ecwid
 */
export const handleGetAdminPendingOrders: RequestHandler = async (req, res) => {
  try {
    // Use the same function as OrderHistory for consistency
    const pendingOrders = await getPendingOrders();

    if (!pendingOrders || pendingOrders.length === 0) {
      return res.json({
        success: true,
        orders: [],
        count: 0,
      });
    }

    // Format orders with customer details
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
