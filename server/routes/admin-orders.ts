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

    // Convert orderId to number since it comes as a string from params
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    console.log(`Fetching order detail for ID: ${orderIdNumber}`);

    // Try to fetch with all columns, fall back to basic columns if some don't exist
    let order: any;
    let error: any;

    // First try with all columns
    const { data: fullOrder, error: fullError } = await supabase
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
        customers(id,first_name,last_name,email,phone),
        order_items(id,quantity,product_name,options,design_file_url),
        proofs(id,status,description,created_at,updated_at)
        `,
      )
      .eq("id", orderIdNumber)
      .single();

    if (fullOrder) {
      order = fullOrder;
      error = null;
    } else if (
      fullError &&
      (fullError.message.includes("column") || fullError.code === "42703")
    ) {
      // If column doesn't exist (code 42703 is PostgreSQL "column does not exist"), try without the new columns
      console.log("New columns not available yet, fetching with basic columns");
      const { data: basicOrder, error: basicError } = await supabase
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
          customers(id,first_name,last_name,email,phone),
          order_items(id,quantity,product_name,options,design_file_url),
          proofs(id,status,description,created_at,updated_at)
          `,
        )
        .eq("id", orderIdNumber)
        .single();

      order = basicOrder;
      error = basicError;

      if (basicOrder) {
        console.log(
          `Successfully fetched order ${orderIdNumber} with basic columns`,
        );
      }
    } else {
      order = fullOrder;
      error = fullError;
    }

    if (error) {
      console.error("Error fetching order detail:", {
        orderId: orderIdNumber,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });

      // Provide more specific error messages
      if (error.code === "PGRST301") {
        return res
          .status(403)
          .json({ error: "Permission denied - check your access level" });
      }

      return res.status(404).json({
        error: "Order not found",
        debug:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    if (!order) {
      console.warn(`Order not found for ID: ${orderIdNumber}`);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`Successfully fetched order ${orderIdNumber}`);

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
      shippingAddress: order.shipping_address || undefined,
      trackingNumber: order.tracking_number || undefined,
      trackingCarrier: order.tracking_carrier || undefined,
      trackingUrl: order.tracking_url || undefined,
      shippedDate: order.shipped_date || undefined,
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
 * Supports page, limit, and date query parameters for pagination and filtering
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
    const dateFilter = (req.query.date as string) || null;

    console.log(
      `Fetching orders - Page: ${page}, Limit: ${limit}, Offset: ${offset}, Date: ${dateFilter || "all"}`,
    );

    // Build the initial query
    let countQuery = supabase
      .from("orders")
      .select("id", { count: "exact", head: true });
    let dataQuery = supabase
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
      .order("created_at", { ascending: false });

    // Apply date filter if provided
    if (dateFilter) {
      // Filter by date (created_at between start and end of day)
      const startOfDay = `${dateFilter}T00:00:00.000Z`;
      const endOfDay = `${dateFilter}T23:59:59.999Z`;
      countQuery = countQuery
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);
      dataQuery = dataQuery
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);
    }

    // First, get the total count of orders
    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error("Error getting order count:", countError);
      throw countError;
    }

    // Fetch paginated orders from Supabase
    let supabaseOrders: any[] = [];
    try {
      const result = await dataQuery.range(offset, offset + limit - 1); // Paginate

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
    const {
      status,
      tracking_number,
      tracking_carrier,
      tracking_url,
      shipping_address,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Convert orderId to number
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const updateData: any = {};
    const validStatuses = [
      "pending_payment",
      "paid",
      "pending",
      "processing",
      "printing",
      "cutting",
      "preparing for shipping",
      "in transit",
      "shipped",
      "delivered",
      "cancelled",
      "payment_failed",
      "completed",
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

    // Add shipping address if provided
    if (shipping_address !== undefined) {
      updateData.shipping_address = shipping_address || null;
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
      .eq("id", orderIdNumber)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", {
        orderId: orderIdNumber,
        error: error.message,
        code: error.code,
      });

      // If error is about missing column (shipped_date), try updating without it
      if (error.code === "42703" && error.message.includes("shipped_date")) {
        console.log(
          "shipped_date column not available yet, retrying without it",
        );

        // Remove shipped_date and try again
        delete updateData.shipped_date;

        const { data: retryData, error: retryError } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", orderIdNumber)
          .select()
          .single();

        if (retryError) {
          console.error("Retry error updating order:", retryError);
          return res.status(500).json({ error: "Failed to update order" });
        }

        return res.json({
          success: true,
          message: "Order updated successfully",
          order: retryData,
        });
      }

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

    // Convert orderId to number
    const orderIdNumber = parseInt(orderId, 10);
    if (isNaN(orderIdNumber)) {
      return res.status(400).json({ error: "Invalid order ID format" });
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
      .eq("id", orderIdNumber)
      .select()
      .single();

    if (error) {
      console.error("Error updating shipping address:", {
        orderId: orderIdNumber,
        error: error.message,
        code: error.code,
      });

      // If column doesn't exist (code 42703 is PostgreSQL "column does not exist")
      if (
        error.code === "42703" &&
        error.message.includes("shipping_address")
      ) {
        console.error(
          "shipping_address column not available - migration not applied",
        );
        return res.status(500).json({
          error:
            "Database migration not applied. The shipping_address column does not exist yet. Please contact administrator.",
        });
      }

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
