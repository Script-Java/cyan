import { Router } from "express";
import { verifyToken, requireAdmin } from "../middleware/auth";
import {
  handleGetProduct,
  handleGetProductOptions,
  handleGetPublicProduct,
  handleGetStorefrontProducts,
} from "./products";
import {
  handleCreateProduct,
  handleUpdateProduct,
  handleGetAdminProducts,
  handleGetAdminProduct,
  handleDeleteAdminProduct,
  handleImportAdminProduct,
  handleGetAdminProductPublic,
  handleGetImportedProductPublic,
} from "./admin-products";

/**
 * Product Routes - Public and Admin product management
 * 
 * Public routes: /api/products/* - no authentication
 * Admin routes: /api/admin/products/* - require authentication + admin role
 */
export function createProductRouter() {
  const router = Router();

  // ===== PUBLIC ROUTES =====
  // GET /api/products/:productId - Get product details
  router.get("/:productId", handleGetProduct);

  // GET /api/products/:productId/options - Get product options
  router.get("/:productId/options", handleGetProductOptions);

  // GET /api/public/products/:productId - Get public product
  router.get("/public/:productId", handleGetPublicProduct);

  // GET /api/public/products/admin/:id - Get admin product (public)
  router.get("/public/admin/:id", handleGetAdminProductPublic);

  // GET /api/public/products/imported/:id - Get imported product (public)
  router.get("/public/imported/:id", handleGetImportedProductPublic);

  // GET /api/storefront/products - Get all storefront products
  router.get("/storefront/list", handleGetStorefrontProducts);

  // ===== ADMIN ROUTES (Protected - admin only) =====
  // POST /api/products - Create product
  router.post("/", verifyToken, requireAdmin, handleCreateProduct);

  // GET /api/admin/products - Get all admin products
  router.get("/admin/list", verifyToken, requireAdmin, handleGetAdminProducts);

  // POST /api/admin/products/import - Import product
  router.post("/admin/import", verifyToken, requireAdmin, handleImportAdminProduct);

  // GET /api/admin/products/:productId - Get product (admin)
  router.get("/admin/:productId", verifyToken, requireAdmin, handleGetAdminProduct);

  // PUT /api/products/:productId - Update product
  router.put("/:productId", verifyToken, requireAdmin, handleUpdateProduct);

  // DELETE /api/admin/products/:productId - Delete product
  router.delete("/admin/:productId", verifyToken, requireAdmin, handleDeleteAdminProduct);

  return router;
}
