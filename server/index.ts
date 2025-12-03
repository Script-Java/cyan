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
  handleSquareWebhook,
  handleCreatePayment,
} from "./routes/square";
import { processSquarePayment } from "./routes/square-payment";
import {
  handleUploadDigitalFile,
  handleGetOrderFiles,
  handleDeleteDigitalFile,
} from "./routes/digital-files";
import {
  handleGetEcwidProduct,
  handleListEcwidProducts,
  handleSearchEcwidProducts,
} from "./routes/ecwid-products";
import {
  handleImportProducts,
  handleGetProducts,
  handleDeleteAllProducts,
} from "./routes/import-products";
import {
  handleGetProofs,
  handleGetProofDetail,
  handleApproveProof,
  handleDenyProof,
  handleAddProofComment,
  handleGetProofNotifications,
  handleSendProofToCustomer,
  handleGetAdminProofs,
  handleAddAdminProofComment,
} from "./routes/proofs";
import {
  handleGetAdminPendingOrders,
  handleUpdateOrderStatus,
  handleGetAllAdminOrders,
} from "./routes/admin-orders";
import {
  handleGetAllCustomers,
  handleGetCustomerDetails,
  handleSearchCustomers,
} from "./routes/admin-customers";
import { handleGetAnalytics } from "./routes/admin-analytics";
import { handleGetFinance } from "./routes/admin-finance";
import {
  handleCreateProduct,
  handleUpdateProduct,
  handleGetAdminProducts,
  handleGetAdminProduct,
  handleDeleteAdminProduct,
  handleGetPublicProduct,
} from "./routes/admin-products";
import {
  handleCreateLabel,
  handleGetRates,
  handleGetCarriers,
  handleGetServices,
} from "./routes/shipping";
import { verifyToken, optionalVerifyToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Security headers for Square Web Payments SDK and general security
  app.use((req, res, next) => {
    // Content Security Policy for Square Web Payments SDK
    // Allows Square's scripts and connections for payment processing
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://connect.squareup.com",
        "connect-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://*.squareupsandbox.com https://*.squareup.com https://connect.squareup.com https://connect.squareupsandbox.com",
        "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://*.squareupsandbox.com https://*.squareup.com",
        "img-src 'self' https: data:",
        "style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com",
        "font-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://fonts.googleapis.com",
        "object-src 'none'",
      ].join("; "),
    );

    // HTTPS enforcement (Secure Context requirement)
    // Redirect HTTP to HTTPS in production
    if (
      process.env.NODE_ENV === "production" &&
      req.header("x-forwarded-proto") !== "https"
    ) {
      return res.redirect(
        301,
        `https://${req.header("host")}${req.originalUrl}`,
      );
    }

    // Additional security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    next();
  });

  // Error handling for JSON parsing
  app.use((err: any, _req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && "body" in err) {
      console.error("JSON parsing error:", err.message);
      return res.status(400).json({ error: "Invalid JSON in request body" });
    }
    if (err) {
      console.error("Unhandled middleware error:", err);
      return next(err);
    }
    next();
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

  // ===== Admin Products Routes (Public - for customer-facing product pages) =====
  app.get("/api/public/products/:productId", handleGetPublicProduct);

  // ===== Ecwid Products Routes (Public) =====
  // Note: Order matters! More specific routes first
  app.get("/api/ecwid-products/search", handleSearchEcwidProducts);
  app.get("/api/ecwid-products/:productId", handleGetEcwidProduct);
  app.get("/api/ecwid-products", handleListEcwidProducts);

  // ===== Imported Products Routes =====
  app.get("/api/imported-products", handleGetProducts);
  app.post("/api/import-products", handleImportProducts);
  app.delete(
    "/api/imported-products/all",
    verifyToken,
    handleDeleteAllProducts,
  );

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
  app.post("/api/square/process-payment", processSquarePayment);
  app.post("/api/square/create-payment", handleCreatePayment);
  app.post("/api/webhooks/square", handleSquareWebhook);

  // ===== Admin Routes (No auth required for now, add auth middleware in production) =====
  app.get("/api/admin/orders/:orderId", handleAdminGetOrder);
  app.get("/api/admin/customers", verifyToken, handleGetAllCustomers);
  app.get("/api/admin/customers/search", verifyToken, handleSearchCustomers);
  app.get(
    "/api/admin/customers/:customerId",
    verifyToken,
    handleGetCustomerDetails,
  );
  app.get("/api/admin/analytics", verifyToken, handleGetAnalytics);
  app.get("/api/admin/finance", verifyToken, handleGetFinance);

  // ===== Admin Products Routes (Protected) =====
  app.post("/api/products", verifyToken, handleCreateProduct);
  app.put("/api/products/:productId", verifyToken, handleUpdateProduct);
  app.get("/api/admin/products", verifyToken, handleGetAdminProducts);
  app.get("/api/admin/products/:productId", verifyToken, handleGetAdminProduct);
  app.delete(
    "/api/admin/products/:productId",
    verifyToken,
    handleDeleteAdminProduct,
  );

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

  // ===== Digital Files Routes =====
  app.post("/api/orders/:orderId/files", verifyToken, handleUploadDigitalFile);
  app.get("/api/orders/:orderId/files", verifyToken, handleGetOrderFiles);
  app.delete("/api/files/:fileId", verifyToken, handleDeleteDigitalFile);

  // ===== Proofs Routes (Protected) =====
  app.get("/api/proofs", verifyToken, handleGetProofs);
  app.get(
    "/api/proofs/notifications",
    verifyToken,
    handleGetProofNotifications,
  );
  app.get("/api/proofs/:proofId", verifyToken, handleGetProofDetail);
  app.post("/api/proofs/:proofId/approve", verifyToken, handleApproveProof);
  app.post("/api/proofs/:proofId/deny", verifyToken, handleDenyProof);
  app.post("/api/proofs/:proofId/comments", verifyToken, handleAddProofComment);
  app.post("/api/admin/proofs/send", handleSendProofToCustomer);
  app.get("/api/admin/proofs", handleGetAdminProofs);
  app.post("/api/admin/proofs/:proofId/comments", handleAddAdminProofComment);
  app.get("/api/admin/pending-orders", handleGetAdminPendingOrders);
  app.get("/api/admin/all-orders", verifyToken, handleGetAllAdminOrders);
  app.put(
    "/api/admin/orders/:orderId/status",
    verifyToken,
    handleUpdateOrderStatus,
  );

  // ===== Shipping Routes (Protected - admin only) =====
  app.post("/api/shipping/label", verifyToken, handleCreateLabel);
  app.post("/api/shipping/rates", verifyToken, handleGetRates);
  app.get("/api/shipping/carriers", verifyToken, handleGetCarriers);
  app.get("/api/shipping/services", verifyToken, handleGetServices);

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
