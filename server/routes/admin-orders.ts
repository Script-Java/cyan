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
 * Get all orders from Supabase (admin only)
 * Fetches all orders regardless of status
 * Returns orders with customer details and tracking info
 */
export const handleGetAllAdminOrders: RequestHandler = async (req, res) => {
  try {
    // Fetch all orders with customer and order items
    let allOrders: any[] = [];
    let error: any = null;

    try {
      // Fetch orders with a reasonable limit to prevent timeouts
      // Admin can paginate if needed
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
          tracking_number,
          tracking_carrier,
          tracking_url,
          shipped_date,
          shipping_address,
          customers(id,first_name,last_name,email),
          order_items(id,quantity,product_name,options,design_file_url)
          `
        )
        .order("created_at", { ascending: false })
        .limit(1000); // Reasonable limit to prevent large response

      allOrders = result.data || [];
      error = result.error;
    } catch (queryError) {
      console.error("Supabase query exception:", queryError);
      error = queryError;
    }

    if (error) {
      console.error("Error fetching all orders:", {
        message: error.message || String(error),
        error,
      });
      return res.status(500).json({
        error: "Failed to fetch orders",
        details: error.message || "Unknown database error"
      });
    }

    if (!allOrders || allOrders.length === 0) {
      return res.json({
        success: true,
        orders: [],
        count: 0,
      });
    }

    // Format orders with customer details and order items
    const formattedOrders = allOrders.map((order: any) => {
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
          tracking_number: order.tracking_number,
          tracking_carrier: order.tracking_carrier,
          tracking_url: order.tracking_url,
          shipped_date: order.shipped_date,
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
        // Return a minimal order object if formatting fails
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

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
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
