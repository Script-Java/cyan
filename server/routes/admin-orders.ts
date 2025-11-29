import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";
import { ecwidAPI } from "../utils/ecwid";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

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
 * Get all pending/unshipped orders from all sources (admin only)
 * Returns orders that haven't shipped yet
 */
export const handleGetAdminPendingOrders: RequestHandler = async (
  req,
  res,
) => {
  try {
    const allOrders: OrderWithCustomer[] = [];

    // Fetch from Ecwid - For now, skip Ecwid as we need to implement the API method
    // to fetch all orders without customer ID filter
    try {
      // Note: Ecwid API /orders endpoint without customerId parameter would require
      // implementation of getAllOrders method in the EcwidAPI class
      console.warn(
        "Ecwid getAllOrders not yet implemented for admin view",
      );
    } catch (ecwidError) {
      console.warn("Failed to fetch Ecwid orders:", ecwidError);
    }

    // Fetch from Supabase
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
        console.warn("Failed to fetch Supabase orders:", error);
      } else if (supabaseOrders && Array.isArray(supabaseOrders)) {
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
      console.warn("Failed to fetch Supabase orders:", supabaseError);
    }

    // Remove duplicates (same order ID) and sort by date
    const uniqueOrders = Array.from(
      new Map(allOrders.map((order) => [order.id, order])).values(),
    ).sort(
      (a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    );

    res.json({
      success: true,
      orders: uniqueOrders,
      count: uniqueOrders.length,
    });
  } catch (error) {
    console.error("Get admin pending orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};
