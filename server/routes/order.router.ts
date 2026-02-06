import { Router } from "express";
import { verifyToken, requireAdmin } from "../middleware/auth";
import {
  handleGetOrders,
  handleGetOrder,
  handleCreateOrder,
  handleGetPendingOrders,
  handleGetOrderPublic,
  handleGetOrderStatus,
  handleVerifyOrderAccess,
} from "./orders";
import {
  handleGetOrderDetail,
  handleUpdateOrderStatus,
  handleGetAllAdminOrders,
  handleGetAdminPendingOrders,
  handleUpdateShippingAddress,
  handleUpdateOrderItemOptions,
  handleTestAdminOrders,
  handleDebugOrders,
} from "./admin-orders";

/**
 * Order Routes - Customer, Admin, and Public order management
 *
 * Customer routes: /api/orders/* - require authentication
 * Admin routes: /api/admin/orders/* - require authentication + admin role
 * Public routes: /api/public/orders/* - no authentication (order tracking)
 */
export function createOrderRouter() {
  const router = Router();

  // ===== CUSTOMER ROUTES (Protected) =====
  // GET /api/orders - Get customer's orders
  router.get("/", verifyToken, handleGetOrders);

  // POST /api/orders - Create new order
  router.post("/", verifyToken, handleCreateOrder);

  // GET /api/orders/:orderId - Get specific order details
  router.get("/:orderId", verifyToken, handleGetOrder);

  // ===== ADMIN ROUTES (Protected - admin only) =====
  // IMPORTANT: Specific routes MUST come before parameterized routes like /:orderId

  // GET /api/admin/orders/test - Test admin orders endpoint
  router.get("/test", verifyToken, requireAdmin, handleTestAdminOrders);

  // GET /api/admin/orders/debug - Debug orders (admin only)
  router.get("/debug", verifyToken, requireAdmin, handleDebugOrders);

  // GET /api/admin/orders/pending - Get pending orders
  router.get(
    "/pending",
    verifyToken,
    requireAdmin,
    handleGetAdminPendingOrders,
  );

  // GET /api/admin/all-orders - Get all orders
  router.get("/all", verifyToken, requireAdmin, handleGetAllAdminOrders);

  // POST /api/admin/update-order-item-options - Update order item options
  router.post(
    "/update-item-options",
    verifyToken,
    requireAdmin,
    handleUpdateOrderItemOptions,
  );

  // GET /api/admin/orders/:orderId - Get order details (admin)
  router.get(
    "/:orderId",
    verifyToken,
    requireAdmin,
    handleGetOrderDetail,
  );

  // PUT /api/admin/orders/:orderId/status - Update order status
  router.put(
    "/:orderId/status",
    verifyToken,
    requireAdmin,
    handleUpdateOrderStatus,
  );

  // PUT /api/admin/orders/:orderId/shipping-address - Update shipping address
  router.put(
    "/:orderId/shipping-address",
    verifyToken,
    requireAdmin,
    handleUpdateShippingAddress,
  );

  return router;
}

/**
 * Public Order Routes - No authentication required
 * Used for guest order tracking and confirmation pages
 */
export function createPublicOrderRouter() {
  const router = Router();

  // GET /api/public/orders/:orderId - Get public order summary
  router.get("/:orderId", handleGetOrderPublic);

  // POST /api/public/orders/verify - Verify order access with email/phone
  router.post("/verify", handleVerifyOrderAccess);

  // GET /api/public/orders/status - Get order status by token
  router.get("/status", handleGetOrderStatus);

  return router;
}
