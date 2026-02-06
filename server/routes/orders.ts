import { RequestHandler } from "express";
import {
  getCustomerOrders,
  getOrderById,
  getPendingOrders,
  supabase,
  getScopedSupabaseClient,
} from "../utils/supabase";
import { ecwidAPI } from "../utils/ecwid";
import { parseOrderNumber, formatOrderNumber } from "../utils/order";
import { VerifyOrderAccessSchema, validate } from "../schemas/validation";
import {
  validatePublicAccessToken,
  createPublicAccessToken,
} from "../utils/public-access-tokens";

/**
 * Get customer's orders from Ecwid, BigCommerce, and Supabase with pagination
 * Requires: customerId in JWT token
 * Supports page and limit query parameters for pagination
 * SECURITY: Uses scoped Supabase client with RLS enforcement
 */
export const handleGetOrders: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get pagination params from query string
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      20,
      Math.max(1, parseInt(req.query.limit as string) || 20),
    ); // Max 20 per page
    const offset = (page - 1) * limit;

    console.log(
      `Fetching orders for customer ${customerId} - Page: ${page}, Limit: ${limit}`,
    );

    // SECURITY: Use scoped client to enforce RLS policies
    // Customer can only access their own orders
    const scoped = getScopedSupabaseClient(req);

    // Fetch orders from Ecwid
    let ecwidOrders = [];
    try {
      ecwidOrders = await ecwidAPI.getCustomerOrders(customerId);
    } catch (ecwidError) {
      console.warn("Failed to fetch orders from Ecwid:", ecwidError);
      // Continue without Ecwid orders if API fails
    }

    // Fetch from Supabase for local orders
    let supabaseOrders = [];
    try {
      supabaseOrders = await getCustomerOrders(customerId);
    } catch (supabaseError) {
      console.warn("Failed to fetch orders from Supabase:", supabaseError);
    }

    // Fetch digital files for Ecwid orders from Supabase
    let ecwidDigitalFilesMap = new Map();
    if (ecwidOrders.length > 0) {
      try {
        const { data: digitalFilesData } = await scoped
          .from("digital_files")
          .select("*")
          .in(
            "order_id",
            ecwidOrders.map((o: any) => o.id),
          );

        if (digitalFilesData) {
          digitalFilesData.forEach((file: any) => {
            if (!ecwidDigitalFilesMap.has(file.order_id)) {
              ecwidDigitalFilesMap.set(file.order_id, []);
            }
            ecwidDigitalFilesMap.get(file.order_id).push({
              id: file.id,
              file_name: file.file_name,
              file_url: file.file_url,
              file_type: file.file_type,
              file_size: file.file_size,
              uploaded_at: file.uploaded_at,
            });
          });
        }
      } catch (filesError) {
        console.warn(
          "Failed to fetch digital files for Ecwid orders:",
          filesError,
        );
      }
    }

    // Format Ecwid orders with tracking and design file info
    const formattedEcwidOrders = ecwidOrders.map((order: any) => ({
      id: order.id,
      customerId: order.customerId,
      status:
        order.status ||
        order.fulfillmentStatus ||
        order.paymentStatus ||
        "processing",
      total: order.total,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      shipping: order.shippingCost || 0,
      dateCreated: order.createDate,
      source: "ecwid",
      itemCount: order.items?.length || 0,
      items: order.items || [],
      tracking_number: order.shippingTrackingCode,
      tracking_carrier: order.shippingCarrier,
      tracking_url: order.trackingUrl,
      shipped_date: order.shippingDate,
      estimated_delivery_date: order.estimatedDeliveryDate,
      digital_files: ecwidDigitalFilesMap.get(order.id) || [],
      shippingAddress: order.shippingPerson,
      customerName: order.customerName,
      customerEmail: order.email,
      customerPhone: order.customerPhone,
    }));

    // Fetch digital files for all orders
    const { data: digitalFilesData } = await scoped
      .from("digital_files")
      .select("*")
      .in(
        "order_id",
        supabaseOrders.map((o: any) => o.id),
      );

    const filesMap = new Map();
    if (digitalFilesData) {
      digitalFilesData.forEach((file: any) => {
        if (!filesMap.has(file.order_id)) {
          filesMap.set(file.order_id, []);
        }
        filesMap.get(file.order_id).push({
          id: file.id,
          file_name: file.file_name,
          file_url: file.file_url,
          file_type: file.file_type,
          file_size: file.file_size,
          uploaded_at: file.uploaded_at,
        });
      });
    }

    // Format Supabase orders with digital files and customer info
    const formattedSupabaseOrders = supabaseOrders.map((order: any) => {
      // Fetch customer info for this order
      const customerInfo = order.customers || {};

      return {
        id: order.id,
        customerId: order.customer_id,
        status: order.status || "paid",
        total: order.total,
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        dateCreated: order.created_at,
        source: "supabase",
        itemCount: order.order_items?.length || 0,
        items: order.order_items || [],
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        digital_files: filesMap.get(order.id) || [],
        shippingAddress: order.shipping_address,
        customerName:
          `${customerInfo.first_name || ""} ${customerInfo.last_name || ""}`.trim(),
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
      };
    });

    // Combine and sort by date
    const allOrders = [
      ...formattedEcwidOrders,
      ...formattedSupabaseOrders,
    ].sort(
      (a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
    );

    // Get paginated results
    const paginatedOrders = allOrders.slice(offset, offset + limit);
    const totalCount = allOrders.length;
    const hasMore = offset + limit < totalCount;

    console.log(
      `Fetched ${allOrders.length} total orders, returning page ${page} with ${paginatedOrders.length} orders`,
    );

    res.json({
      success: true,
      orders: paginatedOrders,
      count: paginatedOrders.length,
      pagination: {
        page,
        limit,
        offset,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get single order details from Ecwid or Supabase
 * Requires: customerId in JWT token, orderId in params
 * VALIDATION: Order ID must be a valid integer
 */
export const handleGetOrder: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    const { orderId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // VALIDATION: Parse and validate orderId is a positive integer
    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum) || orderIdNum <= 0) {
      return res.status(400).json({
        error: "Request validation failed",
        details: [
          { field: "orderId", message: "Order ID must be a positive integer" },
        ],
      });
    }
    let order = null;

    // Try Ecwid first
    try {
      order = await ecwidAPI.getOrder(orderIdNum);
      if (order && order.customerId === customerId) {
        // Fetch digital files for this Ecwid order
        let digitalFiles = [];
        try {
          const { data: digitalFilesData } = await supabase
            .from("digital_files")
            .select("*")
            .eq("order_id", orderIdNum);

          if (digitalFilesData) {
            digitalFiles = digitalFilesData.map((file: any) => ({
              id: file.id,
              file_name: file.file_name,
              file_url: file.file_url,
              file_type: file.file_type,
              file_size: file.file_size,
              uploaded_at: file.uploaded_at,
            }));
          }
        } catch (filesError) {
          console.warn(
            "Failed to fetch digital files for Ecwid order:",
            filesError,
          );
        }

        return res.json({
          success: true,
          source: "ecwid",
          order: {
            id: order.id,
            customerId: order.customerId,
            status:
              order.fulfillmentStatus || order.paymentStatus || "processing",
            dateCreated: order.createDate,
            total: order.total,
            subtotal: order.subtotal || 0,
            tax: order.tax || 0,
            shipping: order.shippingCost || 0,
            items: order.items || [],
            shippingAddress: order.shippingPerson,
            billingAddress: order.billingPerson,
            tracking_number: order.shippingTrackingCode,
            tracking_carrier: order.shippingCarrier,
            estimated_delivery_date: order.estimatedDeliveryDate,
            digital_files: digitalFiles,
          },
        });
      }
    } catch (ecwidError) {
      console.warn("Failed to fetch order from Ecwid:", ecwidError);
    }

    // Fallback to Supabase
    order = await getOrderById(orderIdNum, customerId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Fetch digital files for this order
    const { data: digitalFilesData } = await supabase
      .from("digital_files")
      .select("*")
      .eq("order_id", order.id);

    const digitalFiles = (digitalFilesData || []).map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type,
      file_size: file.file_size,
      uploaded_at: file.uploaded_at,
    }));

    res.json({
      success: true,
      source: "supabase",
      order: {
        id: order.id,
        customerId: order.customer_id,
        status: order.status,
        dateCreated: order.created_at,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        items: order.order_items || [],
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        digital_files: digitalFiles,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * Create a new order in Supabase
 * Requires: customerId in JWT token
 * Note: Most orders are created via the /api/checkout endpoint
 */
export const handleCreateOrder: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { items, shippingAddress, billingAddress, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items required" });
    }

    if (!shippingAddress || !billingAddress) {
      return res
        .status(400)
        .json({ error: "Shipping and billing addresses required" });
    }

    // This endpoint is primarily for API use; checkout is the main flow
    res.status(501).json({
      error: "Use /api/checkout endpoint to create orders",
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
 * Protected by verifyToken middleware
 * Note: In a real implementation, verify admin role before granting access
 */
export const handleAdminGetOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID required" });
    }

    // TODO: Add admin role verification
    res.status(501).json({
      error: "Admin order retrieval endpoint coming soon",
    });
  } catch (error) {
    console.error("Admin get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/**
 * Get all pending orders (admin use)
 * Protected by verifyToken middleware
 */
export const handleGetPendingOrders: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pendingOrders = await getPendingOrders();

    const formattedOrders = pendingOrders.map((order) => ({
      id: order.id,
      customerId: order.customer_id,
      customerName: order.customers
        ? `${order.customers.first_name || ""} ${order.customers.last_name || ""}`.trim()
        : "Unknown",
      customerEmail: order.customers?.email || "N/A",
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      dateCreated: order.created_at,
      itemCount: 0,
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Get pending orders error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch pending orders";
    res.status(500).json({ error: message });
  }
};

/**
 * Get order by ID for public access (guest orders after checkout)
 * No authentication required - used for order confirmation after payment
 * VALIDATION: Order ID must be a valid positive integer
 */
export const handleGetOrderPublic: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { token } = req.query;

    let orderIdNum: number;

    // 1. Parse the Order ID
    if (token && typeof token === "string") {
      const validation = await validatePublicAccessToken(token, "order");
      if (!validation.success) {
        return res.status(404).json({ error: "Order not found (Invalid Token)" });
      }
      orderIdNum = parseInt(validation.resourceId, 10);
    } else if (orderId && typeof orderId === "string") {
      try {
        orderIdNum = parseOrderNumber(orderId);
      } catch (parseError) {
        orderIdNum = parseInt(orderId, 10);
      }
    } else {
      return res.status(404).json({ error: "Order ID missing" });
    }

    if (!orderIdNum || isNaN(orderIdNum) || orderIdNum <= 0) {
      return res.status(404).json({ error: "Invalid Order ID" });
    }

    console.log(`[Public Access] Attempting to fetch Order ID: ${orderIdNum}`);

    // 2. SETUP ADMIN CLIENT (Crucial Step)
    const { createClient } = await import("@supabase/supabase-js");

    // Check for both common naming conventions for the Service Role Key
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("CRITICAL ERROR: Missing SUPABASE_SERVICE_ROLE_KEY. Cannot bypass RLS.");
      console.error("Available env vars:", {
        hasUrl: !!process.env.SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      });
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Create a fresh admin client for this request
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // 3. Fetch Order using Admin Client
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        customer_id,
        status,
        created_at,
        total,
        subtotal,
        tax,
        shipping,
        shipping_address,
        billing_address,
        estimated_delivery_date,
        tracking_number,
        tracking_carrier,
        tracking_url,
        shipped_date,
        square_payment_details,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price,
          design_file_url
        )
      `,
      )
      .eq("id", orderIdNum)
      .single();

    if (orderError || !order) {
      console.warn(`[Public Access] Order ${orderIdNum} not found. Error:`, orderError?.message);
      // If error is PGRST116, it means no rows found (RLS or ID doesn't exist)
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(`[Public Access] Successfully found Order ${orderIdNum}`);

    // 4. Fetch Digital Files (using Admin Client)
    const { data: digitalFilesData } = await supabaseAdmin
      .from("digital_files")
      .select("*")
      .eq("order_id", orderIdNum);

    const digitalFiles = (digitalFilesData || []).map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type,
      file_size: file.file_size,
      uploaded_at: file.uploaded_at,
    }));

    // 5. Return Response
    res.json({
      success: true,
      data: {
        id: order.id,
        customer_id: order.customer_id,
        status: order.status,
        date_created: order.created_at,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        products: (order.order_items || []).map((item: any) => ({
          ...item,
          name: item.product_name,
        })),
        shipping_addresses: order.shipping_address
          ? [order.shipping_address]
          : [],
        billing_address: order.billing_address,
        estimated_delivery_date: order.estimated_delivery_date,
        tracking_number: order.tracking_number,
        tracking_carrier: order.tracking_carrier,
        tracking_url: order.tracking_url,
        shipped_date: order.shipped_date,
        square_payment_id: order.square_payment_details?.payment_id || null,
        digital_files: digitalFiles,
      },
    });
  } catch (error) {
    console.error("Get order public error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch order";
    res.status(500).json({ error: errorMsg });
  }
};

/**
 * Verify public order access with customer verification (email or phone)
 * No authentication required - customers verify with order number and email/phone
 * VALIDATION: Request body validated against VerifyOrderAccessSchema
 */
export const handleVerifyOrderAccess: RequestHandler = async (req, res) => {
  try {
    // VALIDATION: Validate request body (order_number and verification_field)
    const validationResult = await validate(VerifyOrderAccessSchema, req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Request validation failed",
        details: validationResult.errors,
      });
    }

    const { order_number, verification_field } = validationResult.data;

    // Parse order number to numeric ID
    let orderIdNum: number;
    try {
      orderIdNum = parseOrderNumber(order_number);
    } catch (err) {
      // Return 404 for invalid format - don't reveal format issues
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const { supabase } = await import("../utils/supabase");

    // Get the order by ID
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, customer_id, public_access_token")
      .eq("id", orderIdNum)
      .maybeSingle();

    if (orderError || !order) {
      // Return 404 for any lookup failure - don't reveal if order exists
      console.warn("Order not found for ID:", orderIdNum);
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify customer info (email or phone) matches order
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("email, phone")
      .eq("id", order.customer_id)
      .maybeSingle();

    if (customerError || !customer) {
      console.warn("Customer not found for order:", order.id);
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verify that the provided field matches customer email or phone
    const emailMatch =
      customer.email &&
      customer.email.toLowerCase() === verification_field.toLowerCase();
    const phoneMatch =
      customer.phone &&
      customer.phone.replace(/\D/g, "") ===
      verification_field.replace(/\D/g, "");

    if (!emailMatch && !phoneMatch) {
      // Log suspicious activity but return generic error
      console.warn("Failed verification attempt for order:", order.id);
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Verification successful - return public access token
    return res.status(200).json({
      success: true,
      verified: true,
      orderId: order.id,
      publicAccessToken: order.public_access_token,
    });
  } catch (error) {
    console.error("Verify order access error:", error);
    return res.status(404).json({
      success: false,
      error: "Order not found",
    });
  }
};

/**
 * Look up order by public access token with prior verification
 * Requires prior successful verification via handleVerifyOrderAccess
 */
export const handleGetOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { publicAccessToken } = req.query;

    if (!publicAccessToken) {
      return res.status(400).json({
        success: false,
        error: "Public access token is required",
      });
    }

    const { supabase } = await import("../utils/supabase");

    // Get the order by public access token (after verification)
    // Try with tracking columns first, fall back to basic columns if they don't exist
    let order: any;
    let orderError: any;

    const { data: fullOrder, error: fullError } = await supabase
      .from("orders")
      .select(
        `
        id,
        customer_id,
        public_access_token,
        status,
        created_at,
        total,
        subtotal,
        tax,
        shipping,
        shipping_address,
        billing_address,
        tracking_number,
        tracking_carrier,
        tracking_url,
        shipped_date,
        order_items (
          id,
          product_id,
          quantity,
          price,
          options,
          design_file_url
        )
      `,
      )
      .eq("public_access_token", publicAccessToken)
      .maybeSingle();

    if (fullOrder) {
      order = fullOrder;
      orderError = null;
    } else if (
      fullError &&
      (fullError.message.includes("column") || fullError.code === "42703")
    ) {
      // If tracking columns don't exist yet, try without them
      console.log("Tracking columns not available yet, fetching basic order");
      const { data: basicOrder, error: basicError } = await supabase
        .from("orders")
        .select(
          `
          id,
          customer_id,
          public_access_token,
          status,
          created_at,
          total,
          subtotal,
          tax,
          shipping,
          shipping_address,
          billing_address,
          order_items (
            id,
            product_id,
            quantity,
            price,
            options,
            design_file_url
          )
        `,
        )
        .eq("public_access_token", publicAccessToken)
        .maybeSingle();

      order = basicOrder;
      orderError = basicError;
    } else {
      order = fullOrder;
      orderError = fullError;
    }

    if (orderError || !order) {
      console.warn(
        "Order not found for public access token:",
        publicAccessToken,
      );
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    console.log("Order found:", {
      id: order.id,
      customer_id: order.customer_id,
    });

    // Fetch customer info for display
    let customerEmail = "";
    let customerName = "";

    if (order.customer_id) {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("email, name")
        .eq("id", order.customer_id)
        .single();

      if (customer) {
        customerEmail = customer.email || "";
        customerName = customer.name || "";
        console.log("Customer found:", {
          email: customerEmail,
          name: customerName,
        });
      }
    }

    // Enrich order items with product details
    const enrichedItems = await Promise.all(
      (order.order_items || []).map(async (item: any) => {
        let productName = `Product #${item.product_id}`;
        let productSku = "";
        let productDescription = "";

        if (item.product_id) {
          try {
            // Handle both numeric and string IDs (e.g., "admin_11" or 11)
            let queryId = item.product_id;
            if (typeof queryId === "string" && queryId.includes("admin_")) {
              // Extract numeric part from "admin_11" -> 11
              const numericPart = queryId.replace("admin_", "");
              queryId = parseInt(numericPart, 10);
            }

            console.log(
              `Fetching product with ID: ${queryId} (original: ${item.product_id})`,
            );

            const { data: product, error: productError } = await supabase
              .from("admin_products")
              .select("name, sku, description")
              .eq("id", queryId)
              .single();

            if (product && product.name) {
              productName = product.name;
              productSku = product.sku || "";
              productDescription = product.description || "";
              console.log(`Product found: ${productName}`);
            } else if (productError) {
              console.warn(`Failed to fetch product ${queryId}:`, productError);
            }
          } catch (err) {
            console.warn(`Error fetching product ${item.product_id}:`, err);
          }
        }

        return {
          ...item,
          product_name: productName,
          product_sku: productSku,
          product_description: productDescription,
          options: item.options || null,
          design_file_url: item.design_file_url || null,
          line_total: (item.price || 0) * (item.quantity || 0),
        };
      }),
    );

    // Fetch digital files if any exist
    const { data: digitalFilesData } = await supabase
      .from("digital_files")
      .select("*")
      .eq("order_id", order.id);

    const digitalFiles = (digitalFilesData || []).map((file: any) => ({
      id: file.id,
      file_name: file.file_name,
      file_url: file.file_url,
      file_type: file.file_type,
      file_size: file.file_size,
      uploaded_at: file.uploaded_at,
    }));

    res.json({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        dateCreated: order.created_at,
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        customerName: customerName || "",
        customerEmail: customerEmail,
        products: enrichedItems,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number || undefined,
        trackingCarrier: order.tracking_carrier || undefined,
        trackingUrl: order.tracking_url || undefined,
        shippedDate: order.shipped_date || undefined,
        digitalFiles: digitalFiles,
      },
    });
  } catch (error) {
    console.error("Get order status error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch order status";
    res.status(500).json({
      success: false,
      error: errorMsg,
    });
  }
};
