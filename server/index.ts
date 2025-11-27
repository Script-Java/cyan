import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleSignup,
  handleBigCommerceAuth,
  handleBigCommerceCallback,
  handleLogout,
} from "./routes/auth";
import {
  handleGetCustomer,
  handleUpdateCustomer,
  handleGetCustomerAddresses,
} from "./routes/customers";
import {
  handleGetOrders,
  handleGetOrder,
  handleCreateOrder,
  handleAdminGetOrder,
} from "./routes/orders";
import { handleGetDesigns, handleGetOrderDesigns } from "./routes/designs";
import { verifyToken, optionalVerifyToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ===== Authentication Routes =====
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/signup", handleSignup);
  app.get("/api/auth/bigcommerce", handleBigCommerceAuth);
  app.get("/api/auth/bigcommerce/callback", handleBigCommerceCallback);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/bigcommerce/signup", handleBigCommerceAuth);

  // ===== Customer Routes (Protected) =====
  app.get("/api/customers/me", verifyToken, handleGetCustomer);
  app.patch("/api/customers/me", verifyToken, handleUpdateCustomer);
  app.get(
    "/api/customers/me/addresses",
    verifyToken,
    handleGetCustomerAddresses,
  );

  // ===== Order Routes (Protected) =====
  app.get("/api/orders", verifyToken, handleGetOrders);
  app.post("/api/orders", verifyToken, handleCreateOrder);
  app.get("/api/orders/:orderId", verifyToken, handleGetOrder);

  // ===== Admin Routes (No auth required for now, add auth middleware in production) =====
  app.get("/api/admin/orders/:orderId", handleAdminGetOrder);

  return app;
}
