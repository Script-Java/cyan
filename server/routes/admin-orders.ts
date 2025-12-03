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

/**
 * Update order status and/or tracking information
 * Allows admins to change order status and add tracking details
 */
export const handleUpdateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, tracking_number, tracking_carrier, tracking_url } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const updateData: any = {};
    const validStatuses = ["pending", "processing", "printing", "preparing for shipping", "in transit", "shipped", "delivered", "cancelled"];

    // Validate status if provided
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`
        });
      }
      updateData.status = status;
    }

    // Add tracking information if provided
    if (tracking_number !== undefined) {
      updateData.tracking_number = tracking_number || null;
    }
    if (tracking_carrier !== undefined) {
      updateData.tracking_carrier = tracking_carrier || null;
    }
    if (tracking_url !== undefined) {
      updateData.tracking_url = tracking_url || null;
    }

    // If tracking information is provided, set the shipped date
    if (tracking_number) {
      updateData.shipped_date = new Date().toISOString();
    }

    updateData.updated_at = new Date().toISOString();

    // Update the order in Supabase
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return res.status(500).json({ error: "Failed to update order" });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      order: data,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update order";
    res.status(500).json({ error: message });
  }
};
