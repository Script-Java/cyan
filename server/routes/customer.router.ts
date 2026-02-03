import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import {
  handleGetCustomer,
  handleUpdateCustomer,
  handleGetCustomerAddresses,
  handleCreateCustomerAddress,
  handleUpdateCustomerAddress,
  handleDeleteCustomerAddress,
  handleDeleteCustomerAccount,
  handleGetStoreCredit,
  handleUploadAvatar,
} from "./customers";
import multer from "multer";

/**
 * Customer Routes - All protected routes for customer profile management
 * All routes require authentication via verifyToken middleware
 */
export function createCustomerRouter(upload: multer.Multer) {
  const router = Router();

  // GET /api/customers/me - Get current customer profile
  router.get("/me", verifyToken, handleGetCustomer);

  // PATCH /api/customers/me - Update customer profile
  router.patch("/me", verifyToken, handleUpdateCustomer);

  // POST /api/customers/me/avatar - Upload customer avatar
  router.post("/me/avatar", verifyToken, upload.single("avatar"), handleUploadAvatar);

  // GET /api/customers/me/addresses - Get customer addresses
  router.get("/me/addresses", verifyToken, handleGetCustomerAddresses);

  // POST /api/customers/me/addresses - Create new address
  router.post("/me/addresses", verifyToken, handleCreateCustomerAddress);

  // PATCH /api/customers/me/addresses/:addressId - Update address
  router.patch("/me/addresses/:addressId", verifyToken, handleUpdateCustomerAddress);

  // DELETE /api/customers/me/addresses/:addressId - Delete address
  router.delete("/me/addresses/:addressId", verifyToken, handleDeleteCustomerAddress);

  // DELETE /api/customers/me/account - Delete customer account
  router.delete("/me/account", verifyToken, handleDeleteCustomerAccount);

  // GET /api/customers/me/store-credit - Get store credit balance
  router.get("/me/store-credit", verifyToken, handleGetStoreCredit);

  return router;
}
