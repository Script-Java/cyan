import { Router } from "express";
import { verifyToken, requireAdmin } from "../middleware/auth";
import {
  handleGetProduct,
  handleGetProductOptions,
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
  handleGetPublicProduct,
  handleGetStorefrontProducts,
} from "./admin-products";

/**
 * Product Routes - Public and Admin product management
 *
 * This router is mounted at multiple paths:
 * - /api/products
 * - /api/admin/products
 * - /api/public/products
 * - /api/storefront
 *
 * Routes are designed to work correctly at each mount point
 */
export function createProductRouter() {
  const router = Router();

  // ===== PUBLIC ROUTES (mounted at /api/products) =====
  // GET /api/products/:productId - Get product details
  router.get("/:productId", handleGetProduct);

  // GET /api/products/:productId/options - Get product options
  router.get("/:productId/options", handleGetProductOptions);

  // ===== PUBLIC ADMIN PRODUCT DISPLAY (mounted at /api/public/products) =====
  // GET /api/public/products/:productId - Get public product
  router.get("/:productId", handleGetPublicProduct);

  // GET /api/public/products/admin/:id - Get admin product (public)
  router.get("/admin/:id", handleGetAdminProductPublic);

  // GET /api/public/products/imported/:id - Get imported product (public)
  router.get("/imported/:id", handleGetImportedProductPublic);

  // ===== STOREFRONT PRODUCTS (mounted at /api/storefront) =====
  // GET /api/storefront/products - Get all storefront products
  router.get("/products", handleGetStorefrontProducts);

  // ===== ADMIN ROUTES (mounted at /api/admin/products) =====
  // POST /api/admin/products - Create product
  router.post("/", verifyToken, requireAdmin, handleCreateProduct);

  // GET /api/admin/products - Get all admin products
  router.get("/", verifyToken, requireAdmin, handleGetAdminProducts);

  // POST /api/admin/products/import - Import product
  router.post("/import", verifyToken, requireAdmin, handleImportAdminProduct);

  // GET /api/admin/products/:productId - Get product (admin)
  router.get("/:productId", verifyToken, requireAdmin, handleGetAdminProduct);

  // PUT /api/admin/products/:productId - Update product
  router.put("/:productId", verifyToken, requireAdmin, handleUpdateProduct);

  // DELETE /api/admin/products/:productId - Delete product
  router.delete("/:productId", verifyToken, requireAdmin, handleDeleteAdminProduct);

  return router;
}
