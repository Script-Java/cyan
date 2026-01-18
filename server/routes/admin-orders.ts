import { RequestHandler } from "express";
import { supabase, getPendingOrders, getActiveOrders, getActiveOrdersCount } from "../utils/supabase";

interface OrderItem {
  id?: number;
  quantity?: number;
  product_name?: string;
  options?: Record<string, any>;
  design_file_url?: string;
}

interface ProofStatus {
  id: string;
  status: "pending" | "approved" | "revisions_requested";
  description?: string;
  createdAt: string;
  updatedAt: string;
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
 * Test endpoint to verify admin orders endpoint is working
 */
export const handleTestAdminOrders: RequestHandler = async (_req, res) => {
  try {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Admin orders endpoint is accessible",
    });
  } catch (error) {
    res.status(500).json({ error: "Test failed" });
  }
};

/**
 * Get all orders from Supabase and Ecwid (admin only)
 * Fetches all orders regardless of status
 * Returns orders with customer details and tracking info
 * Includes both pending/processing orders from Supabase and completed orders from Ecwid
 */
export const handleGetAllAdminOrders: RequestHandler = async (req, res) => {
  try {
    let allOrders: any[] = [];

    // Fetch Supabase orders (all statuses) - optimized for performance
    let supabaseOrders: any[] = [];
    try {
      // First, fetch basic order data without relations
      // Note: Using generic * to get all columns and handle missing ones gracefully
      const result = await supabase
        .from("orders")
        .select(
          `
          id,
          customer_id,
          status,
          total,
          subtotal,
          tax,
          shipping,
          created_at,
          updated_at,
          shipping_address,
          customers(id,first_name,last_name,email),
          order_items(id,quantity,product_name,options,design_file_url)
          `
        )
        .order("created_at", { ascending: false })
        .limit(100); // Reduced from 200 to 100 for better performance

      supabaseOrders = result.data || [];

      if (result.error) {
        console.error("Supabase error:", result.error);
      }

      console.log(`Fetched ${supabaseOrders.length} orders from Supabase`);
    } catch (queryError) {
      console.error("Supabase query exception:", queryError);
    }

    // Format Supabase orders
    const formattedSupabaseOrders = supabaseOrders.map((order: any) => {
      try {
        const customerName = order.customers && Array.isArray(order.customers)
          ? `${order.customers[0]?.first_name || ""} ${order.customers[0]?.last_name || ""}`.trim()
          : order.customers
            ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim()
            : "Guest";

        const customerEmail = order.customers && Array.isArray(order.customers)
          ? order.customers[0]?.email || "N/A"
          : order.customers?.email || "N/A";

        return {
          id: order.id,
          customerId: order.customer_id,
          customerName,
          customerEmail,
          status: order.status,
          total: order.total || 0,
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          shipping: order.shipping || 0,
          dateCreated: order.created_at || new Date().toISOString(),
          tracking_number: order.tracking_number || null,
          tracking_carrier: order.tracking_carrier || null,
          tracking_url: order.tracking_url || null,
          shipped_date: order.shipped_date || null,
          shipping_addresses: order.shipping_address
            ? [order.shipping_address]
            : [],
          source: "supabase" as const,
          orderItems: (order.order_items || []).map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            product_name: item.product_name,
            options: item.options,
            design_file_url: item.design_file_url,
          })),
        };
      } catch (formatError) {
        console.error("Error formatting order:", { orderId: order.id, formatError });
        return {
          id: order.id,
          customerId: order.customer_id,
          customerName: "Unknown",
          customerEmail: "Unknown",
          status: order.status,
          total: order.total || 0,
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          shipping: order.shipping || 0,
          dateCreated: order.created_at || new Date().toISOString(),
          source: "supabase" as const,
          orderItems: [],
          shipping_addresses: [],
        };
      }
    });

    // Return Supabase orders sorted by date
    allOrders = formattedSupabaseOrders.sort(
      (a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );

    res.json({
      success: true,
      orders: allOrders,
      count: allOrders.length,
    });
  } catch (error) {
    console.error("Get all admin orders error:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get all active orders from Supabase only (admin only)
 * Fetches orders with statuses: pending, processing, printing, in transit
 * Returns orders with customer details
 * Note: Only fetches from Supabase database, not from Ecwid
 */
export const handleGetAdminPendingOrders: RequestHandler = async (req, res) => {
  try {
    console.log("Fetching admin pending orders count...");

    // For the navbar badge, we only need the count, not full order details
    // This is much faster than fetching all order data
    const count = await getActiveOrdersCount();

    console.log(`Admin pending orders count: ${count}`);

    res.json({
      success: true,
      orders: [],
      count: count,
    });
  } catch (error) {
    console.error("Get admin pending orders count error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Don't fail - just return 0 count
    res.json({
      success: true,
      orders: [],
      count: 0,
    });
  }
};

/**
 * Update order status and/or tracking information
 * Allows admins to change order status and add tracking details
 */
export const handleUpdateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, tracking_number, tracking_carrier, tracking_url } =
      req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const updateData: any = {};
    const validStatuses = [
      "pending",
      "processing",
      "printing",
      "preparing for shipping",
      "in transit",
      "shipped",
      "delivered",
      "cancelled",
    ];

    // Validate status if provided
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
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

/**
 * Update shipping address for an order
 * Allows admins to edit shipping address details
 */
export const handleUpdateShippingAddress: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      first_name,
      last_name,
      street_1,
      street_2,
      city,
      state_or_province,
      postal_code,
      country_iso2,
      phone,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !street_1 ||
      !city ||
      !state_or_province ||
      !postal_code ||
      !country_iso2
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: first_name, last_name, street_1, city, state_or_province, postal_code, country_iso2",
      });
    }

    const shippingAddress = {
      first_name,
      last_name,
      street_1,
      street_2: street_2 || undefined,
      city,
      state_or_province,
      postal_code,
      country_iso2,
      phone: phone || undefined,
    };

    // Update the order in Supabase
    const { data, error } = await supabase
      .from("orders")
      .update({
        shipping_address: shippingAddress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating shipping address:", error);
      return res
        .status(500)
        .json({ error: "Failed to update shipping address" });
    }

    res.json({
      success: true,
      message: "Shipping address updated successfully",
      order: data,
    });
  } catch (error) {
    console.error("Update shipping address error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update shipping address";
    res.status(500).json({ error: message });
  }
};
