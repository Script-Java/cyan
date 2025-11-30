import { RequestHandler } from "express";
import { supabase, getPendingOrders } from "../utils/supabase";
import { ecwidAPI } from "../utils/ecwid";

interface OrderWithCustomer {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  dateCreated: string;
  source: "ecwid" | "supabase";
}

/**
 * Get all pending/unshipped orders from Supabase only (admin only)
 * Returns orders that haven't shipped yet
 * Note: Only fetches from Supabase, not from Ecwid
 */
export const handleGetAdminPendingOrders: RequestHandler = async (req, res) => {
  try {
    const allOrders: OrderWithCustomer[] = [];

    // Fetch only from Supabase
    try {
      const { data: supabaseOrders, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          customer_id,
          status,
          total,
          created_at,
          customers:customer_id (id, email, first_name, last_name)
        `,
        )
        .in("status", ["pending", "paid", "processing", "ready_to_ship"]);

      if (error) {
        console.error("Failed to fetch Supabase orders:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch orders from database" });
      }

      if (supabaseOrders && Array.isArray(supabaseOrders)) {
        const pendingSupabaseOrders = supabaseOrders.map((order: any) => ({
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
        allOrders.push(...pendingSupabaseOrders);
      }
    } catch (supabaseError) {
      console.error("Failed to fetch Supabase orders:", supabaseError);
      return res
        .status(500)
        .json({ error: "Failed to fetch orders from database" });
    }

    // Sort by date (newest first)
    const sortedOrders = allOrders.sort(
      (a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    );

    res.json({
      success: true,
      orders: sortedOrders,
      count: sortedOrders.length,
    });
  } catch (error) {
    console.error("Get admin pending orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};
