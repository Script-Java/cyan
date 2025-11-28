import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleSignup,
  handleLogout,
  handleAdminSetup,
} from "./routes/auth";
import {
  handleGetCustomer,
  handleUpdateCustomer,
  handleGetCustomerAddresses,
  handleCreateCustomerAddress,
  handleUpdateCustomerAddress,
  handleDeleteCustomerAddress,
  handleDeleteCustomerAccount,
  handleGetStoreCredit,
} from "./routes/customers";
import {
  handleGetOrders,
  handleGetOrder,
  handleCreateOrder,
  handleAdminGetOrder,
  handleGetPendingOrders,
} from "./routes/orders";
import { handleGetDesigns, handleGetOrderDesigns } from "./routes/designs";
import {
  handleCreateCart,
  handleGetCart,
  handleAddToCart,
  handleUpdateCartItem,
  handleRemoveFromCart,
  handleClearCart,
} from "./routes/cart";
import { handleCheckout, handleGetCheckoutDetails } from "./routes/checkout";
import {
  handleGetCustomerCredit,
  handleGetAllCustomersCredit,
  handleModifyStoreCredit,
  handleGetCreditHistory,
  handleApplyStoreCreditToOrder,
} from "./routes/store-credit";
import {
  handleSupportSubmit,
  handleGetTickets,
  handleGetTicketDetails,
  handleAdminGetAllTickets,
  handleAdminReplyToTicket,
  handleUpdateTicketStatus,
  handleCustomerReplyToTicket,
} from "./routes/support";
import { handleGetProduct, handleGetProductOptions } from "./routes/products";
import {
  handleGetPaymentMethods,
  handleProcessPayment,
} from "./routes/payments";
import {
  handleEcwidOrderWebhook,
  handleWebhookHealth,
} from "./routes/webhooks";
import {
  handleSquarePayment,
  handleGetSquareConfig,
  handleGetSquareLocations,
  handleTestSquareConfig,
  handleCreateCheckoutSession,
  handleConfirmCheckout,
} from "./routes/square";
import {
  handleUploadDigitalFile,
  handleGetOrderFiles,
  handleDeleteDigitalFile,
} from "./routes/digital-files";
import { verifyToken, optionalVerifyToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Error handling for JSON parsing
  app.use((err: any, _req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && "body" in err) {
      console.error("JSON parsing error:", err.message);
      return res.status(400).json({ error: "Invalid JSON in request body" });
    }
    if (err) {
      console.error("Unhandled middleware error:", err);
    }
    next(err);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ===== Authentication Routes =====
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/signup", handleSignup);
  app.post("/api/auth/logout", handleLogout);
  app.post("/api/auth/admin-setup", handleAdminSetup);

  // ===== Customer Routes (Protected) =====
  app.get("/api/customers/me", verifyToken, handleGetCustomer);
  app.patch("/api/customers/me", verifyToken, handleUpdateCustomer);
  app.get(
    "/api/customers/me/addresses",
    verifyToken,
    handleGetCustomerAddresses,
  );
  app.post(
    "/api/customers/me/addresses",
    verifyToken,
    handleCreateCustomerAddress,
  );
  app.patch(
    "/api/customers/me/addresses/:addressId",
    verifyToken,
    handleUpdateCustomerAddress,
  );
  app.delete(
    "/api/customers/me/addresses/:addressId",
    verifyToken,
    handleDeleteCustomerAddress,
  );
  app.delete(
    "/api/customers/me/account",
    verifyToken,
    handleDeleteCustomerAccount,
  );
  app.get("/api/customers/me/store-credit", verifyToken, handleGetStoreCredit);

  // ===== Order Routes (Protected) =====
  app.get("/api/orders", verifyToken, handleGetOrders);
  app.post("/api/orders", verifyToken, handleCreateOrder);
  app.get("/api/orders/:orderId", verifyToken, handleGetOrder);
  app.get("/api/admin/orders/pending", verifyToken, handleGetPendingOrders);

  // ===== Design Routes (Protected) =====
  app.get("/api/designs", verifyToken, handleGetDesigns);
  app.get("/api/orders/:orderId/designs", verifyToken, handleGetOrderDesigns);

  // ===== Cart Routes (Public) =====
  app.post("/api/cart", handleCreateCart);
  app.get("/api/cart/:cartId", handleGetCart);
  app.post("/api/cart/:cartId/items", handleAddToCart);
  app.patch("/api/cart/:cartId/items/:itemIndex", handleUpdateCartItem);
  app.delete("/api/cart/:cartId/items/:itemIndex", handleRemoveFromCart);
  app.delete("/api/cart/:cartId", handleClearCart);

  // ===== Checkout Routes (Public - guest checkout supported) =====
  app.post("/api/checkout", handleCheckout);
  app.get("/api/checkout/:cartId", handleGetCheckoutDetails);

  // ===== Products Routes (Public) =====
  app.get("/api/products/:productId", handleGetProduct);
  app.get("/api/products/:productId/options", handleGetProductOptions);

  // ===== Payments Routes (Public) =====
  app.get("/api/payments/methods", handleGetPaymentMethods);
  app.post("/api/payments/process", handleProcessPayment);

  // ===== Square Payment Routes (Public) =====
  app.get("/api/square/config", handleGetSquareConfig);
  app.get("/api/square/locations", handleGetSquareLocations);
  app.get("/api/square/test", handleTestSquareConfig);
  app.post("/api/square/checkout", handleCreateCheckoutSession);
  app.post("/api/square/confirm-checkout", handleConfirmCheckout);
  app.post("/api/square/pay", handleSquarePayment);

  // ===== Admin Routes (No auth required for now, add auth middleware in production) =====
  app.get("/api/admin/orders/:orderId", handleAdminGetOrder);

  // ===== Store Credit Routes (Protected - admin only) =====
  app.get(
    "/api/store-credit/customers",
    verifyToken,
    handleGetAllCustomersCredit,
  );
  app.get(
    "/api/store-credit/:customerId",
    verifyToken,
    handleGetCustomerCredit,
  );
  app.get(
    "/api/store-credit/:customerId/history",
    verifyToken,
    handleGetCreditHistory,
  );
  app.post("/api/store-credit/modify", verifyToken, handleModifyStoreCredit);
  app.post(
    "/api/store-credit/apply-to-order",
    verifyToken,
    handleApplyStoreCreditToOrder,
  );

  // ===== Support Routes =====
  app.post("/api/support/submit", handleSupportSubmit);
  app.get("/api/support/tickets", verifyToken, handleGetTickets);
  app.get(
    "/api/support/tickets/:ticketId",
    verifyToken,
    handleGetTicketDetails,
  );
  app.post(
    "/api/support/tickets/:ticketId/reply",
    verifyToken,
    handleCustomerReplyToTicket,
  );
  app.get("/api/admin/tickets", handleAdminGetAllTickets);
  app.post("/api/admin/tickets/:ticketId/reply", handleAdminReplyToTicket);
  app.patch("/api/admin/tickets/:ticketId/status", handleUpdateTicketStatus);

  // ===== Webhook Routes =====
  app.post("/api/webhooks/ecwid", handleEcwidOrderWebhook);
  app.get("/api/webhooks/health", handleWebhookHealth);

  // Global error handler - must be last
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Global error handler:", err);
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal server error";
    res.status(statusCode).json({
      error: message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });

  return app;
}
