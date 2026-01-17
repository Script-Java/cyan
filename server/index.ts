// Only load dotenv in development (not in production on Fly.io)
// In production, environment variables should be set via Fly.io secrets
if (process.env.NODE_ENV !== "production") {
  // Use dynamic import for dotenv to avoid issues in ES modules
  import("dotenv/config").catch(() => {
    // dotenv not available, that's okay - environment variables may be set another way
  });
}
import express from "express";
import cors from "cors";
import multer from "multer";
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
  handleUploadAvatar,
} from "./routes/customers";
import {
  handleGetOrders,
  handleGetOrder,
  handleCreateOrder,
  handleAdminGetOrder,
  handleGetPendingOrders,
  handleGetOrderPublic,
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
  handleGetWebhookUrl,
  handleEcwidDiagnostic,
  handleTestWebhook,
} from "./routes/webhooks";
import {
  handleZapierEcwidWebhook,
  handleZapierHealth,
  handleGetZapierWebhookUrl,
} from "./routes/zapier";
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
  handleGetProofDetailPublic,
  handleApproveProofPublic,
  handleDenyProofPublic,
} from "./routes/proofs";
import {
  handleProofEmailPreview,
  handleSendProofEmailPreview,
  handleSignupConfirmationPreview,
  handleOrderConfirmationPreview,
  handleShippingConfirmationPreview,
  handlePasswordResetPreview,
  handleSupportTicketReplyPreview,
  handleOrderStatusUpdatePreview,
} from "./routes/email-preview";
import {
  handleGetAdminPendingOrders,
  handleUpdateOrderStatus,
  handleGetAllAdminOrders,
  handleUpdateShippingAddress,
  handleTestAdminOrders,
} from "./routes/admin-orders";
import {
  handleGetAllCustomers,
  handleGetCustomerDetails,
  handleSearchCustomers,
} from "./routes/admin-customers";
import { handleGetAnalytics, handleTrackEvent } from "./routes/admin-analytics";
import { handleGetFinance } from "./routes/admin-finance";
import {
  handleCreateProduct,
  handleUpdateProduct,
  handleGetAdminProducts,
  handleGetAdminProduct,
  handleDeleteAdminProduct,
  handleGetPublicProduct,
  handleImportAdminProduct,
} from "./routes/admin-products";
import {
  handleCreateLabel,
  handleGetRates,
  handleGetCarriers,
  handleGetServices,
} from "./routes/shipping";
import { handleGetPublicShippingOptions } from "./routes/shipping-public";
import {
  handleGetShippingOptions,
  handleGetShippingOption,
  handleCreateShippingOption,
  handleUpdateShippingOption,
  handleDeleteShippingOption,
} from "./routes/admin-shipping";
import {
  handleGetPublishedBlogs,
  handleGetBlogById,
  handleCreateBlog,
  handleGetAllBlogs,
  handleGetAdminBlogById,
  handleDeleteBlog,
  handleUpdateBlog,
  handleUploadBlogImage,
} from "./routes/blogs";
import adminGalleryRouter from "./routes/admin-gallery";
import {
  handleGetPublishedLegalPages,
  handleGetAllLegalPages,
  handleGetLegalPageByType,
  handleGetAdminLegalPageById,
  handleCreateLegalPage,
  handleUpdateLegalPage,
  handleDeleteLegalPage,
} from "./routes/legal-pages";
import {
  getReturnRefundPolicy,
  updateReturnRefundPolicy,
} from "./routes/admin-return-refund-policy";
import {
  handleEcwidMigration,
  handleGetMigrationStatus,
  handleCSVCustomerImport,
} from "./routes/ecwid-migration";
import { verifyToken, optionalVerifyToken, requireAdmin } from "./middleware/auth";
import {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  checkoutLimiter,
  adminLimiter,
} from "./middleware/rate-limit";

export function createServer() {
  const app = express();

  // CORS Configuration - Allow only trusted origins
  const allowedOrigins = [
    // Frontend URLs - Development
    "http://localhost:5173",
    "http://localhost:8080", // Vite dev server proxy
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    // Custom frontend URL
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://stickershop.test", // Local testing
    // Add production domains here as environment variables
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()) : []),
  ];

  // Allow fly.dev production URLs (Fly.io deployments)
  if (process.env.FLY_APP_NAME) {
    allowedOrigins.push(`https://${process.env.FLY_APP_NAME}.fly.dev`);
  }

  // Allow www subdomain for production URLs
  const allowWwwVariants = (url: string) => {
    if (url.startsWith("https://") && !url.includes("www.")) {
      const wwwUrl = url.replace("https://", "https://www.");
      if (!allowedOrigins.includes(wwwUrl)) {
        allowedOrigins.push(wwwUrl);
      }
    }
  };

  // Add www variants for all https URLs
  [process.env.FRONTEND_URL, ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [])].forEach(url => {
    if (url) {
      allowWwwVariants(url.trim());
    }
  });

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS request blocked from origin: ${origin}`, {
          allowedOrigins,
          flyAppName: process.env.FLY_APP_NAME,
          frontendUrl: process.env.FRONTEND_URL,
        });
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Setup-Key"],
  };

  console.log("✅ CORS Configuration initialized:", {
    allowedOrigins,
    flyAppName: process.env.FLY_APP_NAME,
  });

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Apply rate limiting globally (only in production)
  if (process.env.NODE_ENV === "production") {
    app.use(apiLimiter);
  }

  // Multer configuration for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    },
  });

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

    // Additional security headers for PCI DSS compliance
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Strict Transport Security (HSTS) - Enforce HTTPS for 1 year
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    // Permissions Policy (formerly Feature Policy) - Restrict API access
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=self, usb=()"
    );

    // Prevent MIME sniffing for PCI security
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Additional cache control for sensitive pages
    if (req.path.includes("/checkout") || req.path.includes("/payment")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }

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

  // Health check endpoint for Fly.io and other platforms
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ===== Authentication Routes =====
  app.post("/api/auth/login", authLimiter, handleLogin);
  app.post("/api/auth/signup", authLimiter, handleSignup);
  app.post("/api/auth/logout", handleLogout);
  app.post("/api/auth/admin-setup", authLimiter, handleAdminSetup);

  // ===== Customer Routes (Protected) =====
  app.get("/api/customers/me", verifyToken, handleGetCustomer);
  app.patch("/api/customers/me", verifyToken, handleUpdateCustomer);
  app.post(
    "/api/customers/me/avatar",
    verifyToken,
    upload.single("avatar"),
    handleUploadAvatar,
  );
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
  app.get("/api/admin/orders/pending", verifyToken, requireAdmin, handleGetPendingOrders);

  // ===== Order Routes (Public - for guest order confirmation) =====
  app.get("/api/public/orders/:orderId", handleGetOrderPublic);

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
  app.post("/api/checkout", checkoutLimiter, handleCheckout);
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
  app.post("/api/import-products", verifyToken, requireAdmin, handleImportProducts);
  app.delete(
    "/api/imported-products/all",
    verifyToken,
    requireAdmin,
    handleDeleteAllProducts,
  );

  // ===== Payments Routes (Public) =====
  app.get("/api/payments/methods", handleGetPaymentMethods);
  app.post("/api/payments/process", paymentLimiter, handleProcessPayment);

  // ===== Square Payment Routes (Public) =====
  app.get("/api/square/config", handleGetSquareConfig);
  app.get("/api/square/locations", handleGetSquareLocations);
  app.get("/api/square/test", handleTestSquareConfig);
  app.post("/api/square/checkout", checkoutLimiter, handleCreateCheckoutSession);
  app.post("/api/square/confirm-checkout", paymentLimiter, handleConfirmCheckout);
  app.post("/api/square/pay", paymentLimiter, handleSquarePayment);
  app.post("/api/square/process-payment", paymentLimiter, processSquarePayment);
  app.post("/api/square/create-payment", paymentLimiter, handleCreatePayment);
  app.post("/api/webhooks/square", handleSquareWebhook);

  // ===== Admin Routes (Protected - Admin only) =====
  app.get("/api/admin/orders/:orderId", verifyToken, requireAdmin, handleAdminGetOrder);
  app.get("/api/admin/customers", verifyToken, requireAdmin, handleGetAllCustomers);
  app.get("/api/admin/customers/search", verifyToken, requireAdmin, handleSearchCustomers);
  app.get(
    "/api/admin/customers/:customerId",
    verifyToken,
    requireAdmin,
    handleGetCustomerDetails,
  );
  app.get("/api/admin/analytics", verifyToken, requireAdmin, handleGetAnalytics);
  app.post("/api/analytics/track", handleTrackEvent);
  app.get("/api/admin/finance", verifyToken, requireAdmin, handleGetFinance);

  // ===== Admin Products Routes (Protected - Admin only) =====
  // NOTE: More specific routes must come BEFORE parameterized routes!
  app.post("/api/products", verifyToken, requireAdmin, handleCreateProduct);
  app.put("/api/products/:productId", verifyToken, requireAdmin, handleUpdateProduct);
  app.get("/api/admin/products", verifyToken, requireAdmin, handleGetAdminProducts);
  app.post(
    "/api/admin/products/import",
    verifyToken,
    requireAdmin,
    handleImportAdminProduct,
  );
  app.get("/api/admin/products/:productId", verifyToken, requireAdmin, handleGetAdminProduct);
  app.delete(
    "/api/admin/products/:productId",
    verifyToken,
    requireAdmin,
    handleDeleteAdminProduct,
  );

  // ===== Store Credit Routes (Protected - admin only) =====
  app.get(
    "/api/store-credit/customers",
    verifyToken,
    requireAdmin,
    handleGetAllCustomersCredit,
  );
  app.get(
    "/api/store-credit/:customerId",
    verifyToken,
    requireAdmin,
    handleGetCustomerCredit,
  );
  app.get(
    "/api/store-credit/:customerId/history",
    verifyToken,
    requireAdmin,
    handleGetCreditHistory,
  );
  app.post("/api/store-credit/modify", verifyToken, requireAdmin, handleModifyStoreCredit);
  app.post(
    "/api/store-credit/apply-to-order",
    verifyToken,
    requireAdmin,
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
  app.get("/api/admin/tickets", verifyToken, requireAdmin, handleAdminGetAllTickets);
  app.post(
    "/api/admin/tickets/:ticketId/reply",
    verifyToken,
    requireAdmin,
    handleAdminReplyToTicket,
  );
  app.patch(
    "/api/admin/tickets/:ticketId/status",
    verifyToken,
    requireAdmin,
    handleUpdateTicketStatus,
  );

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
  app.get("/api/proofs/public/:proofId", handleGetProofDetailPublic);
  app.post("/api/proofs/public/:proofId/approve", handleApproveProofPublic);
  app.post("/api/proofs/public/:proofId/deny", handleDenyProofPublic);
  app.post("/api/admin/proofs/send", verifyToken, requireAdmin, handleSendProofToCustomer);
  app.get("/api/admin/proofs", verifyToken, requireAdmin, handleGetAdminProofs);
  app.post("/api/admin/proofs/:proofId/comments", verifyToken, requireAdmin, handleAddAdminProofComment);
  app.get("/api/email-preview/proof", handleProofEmailPreview);
  app.post("/api/email-preview/send", handleSendProofEmailPreview);
  app.get("/api/email-preview/signup", handleSignupConfirmationPreview);
  app.get("/api/email-preview/order-confirmation", handleOrderConfirmationPreview);
  app.get("/api/email-preview/shipping", handleShippingConfirmationPreview);
  app.get("/api/email-preview/password-reset", handlePasswordResetPreview);
  app.get("/api/email-preview/support-reply", handleSupportTicketReplyPreview);
  app.get("/api/email-preview/order-status-update", handleOrderStatusUpdatePreview);
  app.get("/api/admin/pending-orders", verifyToken, requireAdmin, handleGetAdminPendingOrders);
  app.get("/api/admin/orders/test", verifyToken, requireAdmin, handleTestAdminOrders);
  app.get("/api/admin/all-orders", verifyToken, requireAdmin, handleGetAllAdminOrders);
  app.put(
    "/api/admin/orders/:orderId/status",
    verifyToken,
    requireAdmin,
    handleUpdateOrderStatus,
  );
  app.put(
    "/api/admin/orders/:orderId/shipping-address",
    verifyToken,
    requireAdmin,
    handleUpdateShippingAddress,
  );

  // ===== Shipping Routes (Protected - admin only) =====
  app.post("/api/shipping/label", verifyToken, requireAdmin, handleCreateLabel);
  app.post("/api/shipping/rates", verifyToken, requireAdmin, handleGetRates);
  app.get("/api/shipping/carriers", verifyToken, requireAdmin, handleGetCarriers);
  app.get("/api/shipping/services", verifyToken, requireAdmin, handleGetServices);

  // ===== Shipping Options Routes (Public - for checkout) =====
  app.get("/api/shipping-options", handleGetPublicShippingOptions);

  // ===== Shipping Options Routes (Protected - admin only) =====
  app.get("/api/admin/shipping-options", verifyToken, requireAdmin, handleGetShippingOptions);
  app.get(
    "/api/admin/shipping-options/:id",
    verifyToken,
    requireAdmin,
    handleGetShippingOption,
  );
  app.post(
    "/api/admin/shipping-options",
    verifyToken,
    requireAdmin,
    handleCreateShippingOption,
  );
  app.put(
    "/api/admin/shipping-options/:id",
    verifyToken,
    requireAdmin,
    handleUpdateShippingOption,
  );
  app.delete(
    "/api/admin/shipping-options/:id",
    verifyToken,
    requireAdmin,
    handleDeleteShippingOption,
  );

  // ===== Webhook Routes =====
  app.post("/api/webhooks/ecwid", handleEcwidOrderWebhook);
  app.get("/api/webhooks/health", handleWebhookHealth);
  app.get("/api/webhooks/url", handleGetWebhookUrl);
  app.get("/api/webhooks/diagnostic", verifyToken, requireAdmin, handleEcwidDiagnostic);
  app.post("/api/webhooks/test", verifyToken, requireAdmin, handleTestWebhook);

  // ===== Zapier Integration Routes =====
  app.post("/api/zapier/webhook", handleZapierEcwidWebhook);
  app.get("/api/zapier/health", handleZapierHealth);
  app.get("/api/zapier/webhook-url", handleGetZapierWebhookUrl);

  // ===== Ecwid Migration Routes (Protected - admin only) =====
  app.post(
    "/api/admin/ecwid/migrate",
    verifyToken,
    requireAdmin,
    handleEcwidMigration,
  );
  app.get(
    "/api/admin/ecwid/migration-status",
    verifyToken,
    requireAdmin,
    handleGetMigrationStatus,
  );
  app.post(
    "/api/admin/ecwid/import-csv",
    verifyToken,
    requireAdmin,
    handleCSVCustomerImport,
  );

  // ===== Blogs Routes =====
  // Public routes
  app.get("/api/blogs", handleGetPublishedBlogs);
  app.get("/api/blogs/:blogId", handleGetBlogById);

  // Admin routes (Protected - Admin only)
  app.post("/api/admin/blogs", verifyToken, requireAdmin, handleCreateBlog);
  app.get("/api/admin/blogs", verifyToken, requireAdmin, handleGetAllBlogs);
  app.get("/api/admin/blogs/:blogId", verifyToken, requireAdmin, handleGetAdminBlogById);
  app.put("/api/admin/blogs/:blogId", verifyToken, requireAdmin, handleUpdateBlog);
  app.delete("/api/admin/blogs/:blogId", verifyToken, requireAdmin, handleDeleteBlog);
  app.post(
    "/api/admin/upload-image",
    verifyToken,
    requireAdmin,
    upload.single("file"),
    handleUploadBlogImage,
  );

  // ===== Gallery Routes =====
  app.use("/api", adminGalleryRouter);

  // ===== Legal Pages Routes =====
  // Public routes
  app.get("/api/legal-pages", handleGetPublishedLegalPages);
  app.get("/api/legal/:pageType", handleGetLegalPageByType);

  // Admin routes (Protected - Admin only)
  app.post("/api/admin/legal-pages", verifyToken, requireAdmin, handleCreateLegalPage);
  app.get("/api/admin/legal-pages", verifyToken, requireAdmin, handleGetAllLegalPages);
  app.get(
    "/api/admin/legal-pages/:pageId",
    verifyToken,
    requireAdmin,
    handleGetAdminLegalPageById,
  );
  app.put("/api/admin/legal-pages/:pageId", verifyToken, requireAdmin, handleUpdateLegalPage);
  app.delete(
    "/api/admin/legal-pages/:pageId",
    verifyToken,
    requireAdmin,
    handleDeleteLegalPage,
  );

  // ===== Return & Refund Policy Routes =====
  // Public route
  app.get("/api/return-refund-policy", getReturnRefundPolicy);

  // Admin routes (Protected - Admin only)
  app.get(
    "/api/admin/return-refund-policy",
    verifyToken,
    requireAdmin,
    getReturnRefundPolicy,
  );
  app.post(
    "/api/admin/return-refund-policy",
    verifyToken,
    requireAdmin,
    updateReturnRefundPolicy,
  );

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
