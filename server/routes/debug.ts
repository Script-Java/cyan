import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * DEBUG ENDPOINT: Get list of all orders with customer emails
 *
 * SECURITY:
 * - Requires authentication via verifyToken middleware
 * - Requires admin role via requireAdmin middleware
 * - NOT protected by NODE_ENV (production check removed)
 * - Returns PII (emails) - admin only
 *
 * USAGE:
 * - Development: Admin dashboard debugging
 * - Production: Admin troubleshooting only
 *
 * AUDIT:
 * - This endpoint is logged and audited
 * - Access is restricted to authenticated admins only
 */
export const handleDebugOrdersList: RequestHandler = async (req, res) => {
  try {
    // Log access to debug endpoint
    const adminId = (req as any).customerId;
    console.log(`[DEBUG ENDPOINT ACCESS] Admin ${adminId} accessed /api/debug/orders-list at ${new Date().toISOString()}`);

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        status,
        total,
        customer_id
      `,
      )
      .order("id", { ascending: true });

    if (error) {
      console.error("Debug orders list query error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        orders: [],
        total: 0,
      });
    }

    // Fetch customer info for each order (includes PII - emails)
    const ordersWithCustomers = await Promise.all(
      orders.map(async (order) => {
        if (!order.customer_id) {
          return {
            id: order.id,
            display_number: `SY-5${4001 + order.id}`,
            created_at: order.created_at,
            status: order.status,
            total: order.total,
            customer_id: order.customer_id,
            customer_email: null,
          };
        }

        const { data: customer } = await supabase
          .from("customers")
          .select("email")
          .eq("id", order.customer_id)
          .single();

        return {
          id: order.id,
          display_number: `SY-5${4001 + order.id}`,
          created_at: order.created_at,
          status: order.status,
          total: order.total,
          customer_id: order.customer_id,
          customer_email: customer?.email || null,
        };
      }),
    );

    res.status(200).json({
      success: true,
      orders: ordersWithCustomers,
      total: orders.length,
      _debug: {
        endpoint: "/api/debug/orders-list",
        protected_by: ["verifyToken", "requireAdmin"],
        accessed_by_admin: adminId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Debug orders list error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      code: "DEBUG_ENDPOINT_ERROR",
    });
  }
};

/**
 * DEBUG ENDPOINT: Get system health and configuration status
 *
 * SECURITY:
 * - Requires authentication via verifyToken middleware
 * - Requires admin role via requireAdmin middleware
 * - Returns configuration status (safe, no secrets exposed)
 *
 * USAGE:
 * - Admin dashboard for troubleshooting
 * - Check if all services are properly configured
 */
export const handleDebugHealth: RequestHandler = async (req, res) => {
  try {
    const adminId = (req as any).customerId;
    console.log(
      `[DEBUG ENDPOINT ACCESS] Admin ${adminId} accessed /api/debug/health at ${new Date().toISOString()}`,
    );

    // Check database connectivity
    const { data: dbCheck, error: dbError } = await supabase
      .from("orders")
      .select("id")
      .limit(1);

    const dbHealthy = !dbError && dbCheck !== null;

    // Check environment configuration
    const configured = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      SQUARE_APPLICATION_ID: !!process.env.SQUARE_APPLICATION_ID,
      SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      ECWID_API_TOKEN: !!process.env.ECWID_API_TOKEN,
    };

    const allConfigured = Object.values(configured).every((v) => v === true);

    res.status(200).json({
      success: true,
      status: allConfigured && dbHealthy ? "healthy" : "degraded",
      database: {
        connected: dbHealthy,
        error: dbError?.message || null,
      },
      configuration: configured,
      node_env: process.env.NODE_ENV || "not set",
      timestamp: new Date().toISOString(),
      _debug: {
        endpoint: "/api/debug/health",
        protected_by: ["verifyToken", "requireAdmin"],
        accessed_by_admin: adminId,
      },
    });
  } catch (error) {
    console.error("Debug health check error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      code: "DEBUG_HEALTH_ERROR",
    });
  }
};
