import { RequestHandler } from "express";
import {
  supabase,
  getPendingOrders,
  getActiveOrders,
  getActiveOrdersCount,
} from "../utils/supabase";

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
export const handleTestAdminOrders: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const hasToken = !!token;

    res.set("Content-Type", "application/json");
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Admin orders endpoint is accessible",
      auth: {
        hasToken,
        isAdmin: req.isAdmin || false,
        customerId: req.customerId || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Test failed" });
  }
};

/**
 * Debug endpoint to test Supabase order structure
 */
export const handleDebugOrders: RequestHandler = async (req, res) => {
  try {
    console.log("=== DEBUG ORDERS ENDPOINT ===");

    // Fetch first order
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, total")
      .limit(1);

    console.log("Orders query result:", { orders, error: ordersError });

    if (!orders || orders.length === 0) {
      return res.json({
        message: "No orders found",
        error: ordersError,
      });
    }

    const firstOrderId = orders[0].id;
    console.log("First order ID:", firstOrderId, "Type:", typeof firstOrderId);

    // Try to fetch with order_items
    const { data: orderWithItems, error: itemsError } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        total,
        order_items(id, product_name, options)
      `,
      )
      .eq("id", firstOrderId)
      .single();

    console.log("Order with items result:", {
      data: orderWithItems,
      error: itemsError,
    });

    res.json({
      firstOrder: orders[0],
      orderWithItems,
      itemsError,
      debug: {
        orderId: firstOrderId,
        orderIdType: typeof firstOrderId,
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};

/**
 * Get a single order detail from Supabase (admin only)
 * Fetches complete order information including design files
 * Returns full order data with all nested relationships
 */
export const handleGetOrderDetail: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Fetch single order with all details including design files
    const { data: order, error } = await supabase
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
        tracking_number,
        tracking_carrier,
        tracking_url,
        shipped_date,
        customers(id,first_name,last_name,email),
        order_items(id,quantity,product_name,options,design_file_url),
        proofs(id,status,description,created_at,updated_at)
        `,
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order detail:", error);
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Format the response
    const customerName =
      order.customers && Array.isArray(order.customers)
        ? `${order.customers[0]?.first_name || ""} ${order.customers[0]?.last_name || ""}`.trim()
        : order.customers
          ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim()
          : "Guest";

    const customerEmail =
      order.customers && Array.isArray(order.customers)
        ? order.customers[0]?.email || "N/A"
        : order.customers?.email || "N/A";

    const formattedOrder = {
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
      dateUpdated: order.updated_at || new Date().toISOString(),
      source: "supabase" as const,
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
      trackingCarrier: order.tracking_carrier,
      trackingUrl: order.tracking_url,
      shippedDate: order.shipped_date,
      orderItems: (order.order_items || []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product_name: item.product_name,
        options: item.options,
        design_file_url: item.design_file_url,
      })),
      proofs: (order.proofs || []).map((proof: any) => ({
        id: proof.id,
        status: proof.status,
        description: proof.description,
        createdAt: proof.created_at,
        updatedAt: proof.updated_at,
      })),
    };

    res.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error("Get order detail error:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    const message =
      error instanceof Error ? error.message : "Failed to fetch order";
    res.status(500).json({ error: message });
  }
};

/**
 * Get all orders from Supabase (admin only) with pagination
 * Fetches orders regardless of status with pagination to reduce response size
 * Returns orders with customer details and tracking info
 * Supports page and limit query parameters for pagination
 */
export const handleGetAllAdminOrders: RequestHandler = async (req, res) => {
  try {
    // Get pagination params from query string
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit as string) || 20),
    ); // Max 20 per page
    const offset = (page - 1) * limit;

    console.log(
      `Fetching orders - Page: ${page}, Limit: ${limit}, Offset: ${offset}`,
    );

    // First, get the total count of orders
    const { count: totalCount, error: countError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("Error getting order count:", countError);
      throw countError;
    }

    // Fetch paginated orders from Supabase
    let supabaseOrders: any[] = [];
    try {
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
          customers(id,first_name,last_name,email),
          order_items(id,quantity,product_name,options),
          proofs(id,status)
          `,
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1); // Paginate

      supabaseOrders = result.data || [];

      if (result.error) {
        console.error("Supabase error:", result.error);
      }

      console.log(`Fetched ${supabaseOrders.length} orders for page ${page}`);
    } catch (queryError) {
      console.error("Supabase query exception:", queryError);
    }

    // Format Supabase orders
    const formattedSupabaseOrders = supabaseOrders.map((order: any) => {
      try {
        const customerName =
          order.customers && Array.isArray(order.customers)
            ? `${order.customers[0]?.first_name || ""} ${order.customers[0]?.last_name || ""}`.trim()
            : order.customers
              ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim()
              : "Guest";

        const customerEmail =
          order.customers && Array.isArray(order.customers)
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
          source: "supabase" as const,
          orderItems: (order.order_items || []).map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            product_name: item.product_name,
            options: item.options,
          })),
          proofs: (order.proofs || []).map((proof: any) => ({
            id: proof.id,
            status: proof.status,
          })),
        };
      } catch (formatError) {
        console.error("Error formatting order:", {
          orderId: order.id,
          formatError,
        });
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
          proofs: [],
        };
      }
    });

    const hasMore = offset + limit < (totalCount || 0);

    res.json({
      success: true,
      orders: formattedSupabaseOrders,
      pagination: {
        page,
        limit,
        offset,
        totalCount: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasMore,
      },
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

    // Set explicit content type and ensure proper JSON response
    res.set("Content-Type", "application/json");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");

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
    res.set("Content-Type", "application/json");
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

/**
 * Update order item option costs
 * Allows admins to edit the price of individual options for an order item
 */
export const handleUpdateOrderItemOptions: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { orderId, itemId, options } = req.body;

    console.log("Update order item options - received:", {
      orderId,
      itemId,
      optionsCount: options?.length,
    });

    if (!orderId) {
      console.error("Missing orderId in request body");
      return res.status(400).json({ error: "Order ID is required" });
    }

    if (!Array.isArray(options)) {
      console.error("Options is not an array:", typeof options);
      return res.status(400).json({ error: "Options must be an array" });
    }

    // Convert orderId to number
    const numOrderId =
      typeof orderId === "string" ? parseInt(orderId, 10) : orderId;

    console.log(
      "Fetching order_items with orderId:",
      numOrderId,
      "itemId:",
      itemId,
    );

    // Query the order_items table directly instead of through the orders relation
    const { data: allItems, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", numOrderId);

    console.log("Order items query:", {
      count: allItems?.length,
      items: allItems?.map((i: any) => ({
        id: i.id,
        product_name: i.product_name,
        optionsCount: i.options ? Object.keys(i.options).length : 0,
      })),
      error: itemsError,
      itemsError: itemsError
        ? {
            message: itemsError.message,
            code: itemsError.code,
          }
        : null,
    });

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return res.status(500).json({
        error: "Failed to fetch order items",
        details: itemsError.message,
      });
    }

    if (!allItems || allItems.length === 0) {
      console.error("No items found for order:", numOrderId);
      return res.status(404).json({ error: "No items found for this order" });
    }

    // Find the item to update (by UUID ID or index)
    let itemToUpdate = null;
    let itemIndex = -1;

    // First try to match by UUID
    for (let i = 0; i < allItems.length; i++) {
      const itemUuid = String(allItems[i].id).toLowerCase();
      const searchId = String(itemId).toLowerCase();

      if (itemUuid === searchId) {
        itemToUpdate = allItems[i];
        itemIndex = i;
        console.log("Found item by UUID match at index:", i);
        break;
      }
    }

    // If not found by UUID, try by array index
    if (!itemToUpdate && !isNaN(Number(itemId))) {
      const numItemId = Number(itemId);
      if (numItemId >= 0 && numItemId < allItems.length) {
        itemToUpdate = allItems[numItemId];
        itemIndex = numItemId;
        console.log("Found item by index match at:", numItemId);
      }
    }

    if (!itemToUpdate) {
      console.error(
        "Item not found with ID:",
        itemId,
        "Available items:",
        allItems.map((i: any) => i.id),
      );
      return res.status(404).json({ error: "Item not found in this order" });
    }

    console.log("Found item to update at index:", itemIndex);

    // Update the options with new prices
    let updatedOptions = itemToUpdate.options || {};

    if (Array.isArray(updatedOptions)) {
      updatedOptions = updatedOptions.map((opt: any, idx: number) => {
        const newOption = options[idx];
        if (newOption) {
          return {
            ...opt,
            price: newOption.price || 0,
            modifier_price: newOption.price || 0,
          };
        }
        return opt;
      });
    } else if (typeof updatedOptions === "object") {
      updatedOptions = Object.entries(updatedOptions).reduce(
        (acc: any, [key, val]: [string, any], idx: number) => {
          const newOption = options[idx];
          acc[key] = newOption
            ? {
                ...(typeof val === "object" ? val : { value: val }),
                price: newOption.price || 0,
                modifier_price: newOption.price || 0,
              }
            : val;
          return acc;
        },
        {},
      );
    }

    // Update the item in Supabase
    const { data: updatedItem, error: updateError } = await supabase
      .from("order_items")
      .update({
        options: updatedOptions,
      })
      .eq("id", itemToUpdate.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order item:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
      });
      return res.status(500).json({
        error: "Failed to update order item",
        details: updateError.message,
      });
    }

    console.log("Successfully updated order item");
    res.json({
      success: true,
      message: "Option costs updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update order item options error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update option costs";
    res.status(500).json({ error: message });
  }
};
