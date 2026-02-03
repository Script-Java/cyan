// Only load dotenv in development (not in production on Netlify)
// In production, environment variables should be set via Netlify
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
  handleRequestPasswordReset,
  handleResetPassword,
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
  handleGetOrderStatus,
  handleVerifyOrderAccess,
} from "./routes/orders";
import {
  handleGetDesigns,
  handleGetOrderDesigns,
  handleUploadDesignFile,
} from "./routes/designs";
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
  handleVerifyPendingPayment,
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
  handleGetAdminProofDetail,
  handleAddAdminProofComment,
  handleGetProofDetailPublic,
  handleApproveProofPublic,
  handleDenyProofPublic,
  handleApproveProofPublicNew,
  handleReviseProofPublicNew,
} from "./routes/proofs";
import { handleSendProofDirectly } from "./routes/send-proof";
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
  handleGetOrderDetail,
  handleUpdateShippingAddress,
  handleUpdateOrderItemOptions,
  handleTestAdminOrders,
  handleDebugOrders,
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
  handleGetStorefrontProducts,
  handleGetAdminProductPublic,
  handleGetImportedProductPublic,
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
  handleGetInvoices,
  handleGetInvoice,
  handleCreateInvoice,
  handleUpdateInvoice,
  handleSendInvoice,
  handleMarkInvoicePaid,
  handleCancelInvoice,
  handleGetInvoiceByToken,
  handleGetPaymentToken,
  handleCreateInvoicePaymentLink,
  verifySupabaseToken,
} from "./routes/invoices";
import { handleInitializeInvoicesDatabase } from "./routes/db-setup";
import {
  handleUploadArtwork,
  handleGetArtwork,
  handleDeleteArtwork,
  uploadMiddleware,
} from "./routes/invoice-artwork";
import {
  handleEcwidMigration,
  handleGetMigrationStatus,
  handleCSVCustomerImport,
} from "./routes/ecwid-migration";
import {
  handleSubmitReview,
  handleGetProductReviews,
  handleMarkReviewHelpful,
  handleGetAdminReviews,
  handleUpdateReviewStatus,
  handleDeleteReview,
} from "./routes/reviews";
import {
  handleGetDiscountCodes,
  handleGetDiscountCode,
  handleCreateDiscountCode,
  handleUpdateDiscountCode,
  handleDeleteDiscountCode,
  handleValidateDiscountCode,
  handleApplyDiscountCode,
} from "./routes/discounts";
import {
  verifyToken,
  optionalVerifyToken,
  requireAdmin,
} from "./middleware/auth";
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
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:8080", // Vite dev server proxy
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:8080",
    // Custom frontend URL
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://stickershop.test", // Local testing
    // Production domains
    "https://stickyslap.app",
    "https://www.stickyslap.app",
    // Add production domains here as environment variables
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : []),
  ];

  // Allow Netlify deployments
  if (process.env.NETLIFY_SITE_NAME) {
    allowedOrigins.push(`https://${process.env.NETLIFY_SITE_NAME}.netlify.app`);
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
  [
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : []),
  ].forEach((url) => {
    if (url) {
      allowWwwVariants(url.trim());
    }
  });

  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
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
    netliftySiteName: process.env.NETLIFY_SITE_NAME,
    frontendUrl: process.env.FRONTEND_URL,
  });

  // Middleware
  app.use(cors(corsOptions));

  // Middleware to handle pre-parsed bodies (Netlify/serverless-http often parses JSON automatically)
  app.use((req: any, _res, next) => {
    // Check if body is a Buffer (happens in some serverless environments)
    if (req.body && Buffer.isBuffer(req.body)) {
      try {
        const bodyString = req.body.toString("utf8");
        req.body = JSON.parse(bodyString);
        console.log("✅ Parsed Buffer body to JSON successfully");
      } catch (error) {
        console.error("❌ Failed to parse Buffer body:", error);
        // Don't error here, let express.json() or routes handle it
      }
    }
    next();
  });

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
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://connect.squareup.com https://*.ecwid.com https://*.google.com https://*.googleapis.com https://*.gstatic.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
        "connect-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://*.squareupsandbox.com https://*.squareup.com https://connect.squareup.com https://connect.squareupsandbox.com https://*.ecwid.com https://*.google.com https://*.googleapis.com https://*.gstatic.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
        "frame-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://square.com https://*.squareupsandbox.com https://*.squareup.com https://*.ecwid.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
        "img-src 'self' https: data: https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
        "style-src 'self' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://fonts.googleapis.com https://*.ecwid.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
        "font-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com https://fonts.googleapis.com https://*.gstatic.com https://d34ikvsdm2rlij.cloudfront.net https://storefront.ecwid.dev:*",
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
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );

    // Permissions Policy (formerly Feature Policy) - Restrict API access
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=self, usb=()",
    );

    // Prevent MIME sniffing for PCI security
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Additional cache control for sensitive pages
    if (req.path.includes("/checkout") || req.path.includes("/payment")) {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }

    next();
  });

  // Error handling for JSON parsing
  app.use((err: any, _req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && "body" in err) {
      console.error("JSON parsing error:", {
        message: err.message,
        bodyPartial: (err as any).body?.substring?.(0, 200), // Log first 200 chars if available
      });
      return res.status(400).json({ error: "Invalid JSON in request body" });
    }
    if (err) {
      console.error("Unhandled middleware error:", err);
      return next(err);
    }
    next();
  });

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Health check endpoint - verify environment configuration
  app.get("/api/health", (_req, res) => {
    const requiredEnvVars = [
      "SUPABASE_URL",
      "SUPABASE_SERVICE_KEY",
      "JWT_SECRET",
      "SQUARE_APPLICATION_ID",
      "SQUARE_ACCESS_TOKEN",
      "SQUARE_LOCATION_ID",
    ];

    const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
    const isHealthy = missingVars.length === 0;

    const health = {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      configured: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
        JWT_SECRET: !!process.env.JWT_SECRET,
        FRONTEND_URL: !!process.env.FRONTEND_URL,
        BASE_URL: !!process.env.BASE_URL,
        SQUARE_APPLICATION_ID: !!process.env.SQUARE_APPLICATION_ID,
        SQUARE_ACCESS_TOKEN: !!process.env.SQUARE_ACCESS_TOKEN,
        SQUARE_LOCATION_ID: !!process.env.SQUARE_LOCATION_ID,
        ECWID_API_TOKEN: !!process.env.ECWID_API_TOKEN,
        CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      },
      missingVars: process.env.NODE_ENV === "development" ? missingVars : [],
    };

    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  });

  app.get("/api/demo", handleDemo);

  // ===== Authentication Routes =====
  app.post("/api/auth/login", authLimiter, handleLogin);
  app.post("/api/auth/signup", authLimiter, handleSignup);
  app.post("/api/auth/logout", handleLogout);
  app.post("/api/auth/admin-setup", authLimiter, handleAdminSetup);
  app.post(
    "/api/auth/request-password-reset",
    authLimiter,
    handleRequestPasswordReset,
  );
  app.post("/api/auth/reset-password", handleResetPassword);

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
  app.get(
    "/api/admin/orders/pending",
    verifyToken,
    requireAdmin,
    handleGetPendingOrders,
  );

  // ===== Order Routes (Public - for guest order confirmation) =====
  app.get("/api/public/orders/:orderId", handleGetOrderPublic);
  app.get("/api/public/order-status", handleGetOrderStatus);

  // ===== Debug endpoint (development only) =====
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/debug/orders-list", async (req, res) => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.SUPABASE_URL || "",
          process.env.SUPABASE_SERVICE_KEY || "",
        );

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
          return res.status(500).json({ error: error.message });
        }

        // Fetch customer info for each order
        const ordersWithCustomers = await Promise.all(
          (orders || []).map(async (order) => {
            if (!order.customer_id) return { ...order, customer_email: null };

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
              customer_email: customer?.email,
            };
          }),
        );

        res.json({ orders: ordersWithCustomers });
      } catch (error) {
        console.error("Debug orders list error:", error);
        res.status(500).json({ error: String(error) });
      }
    });
  }

  // ===== Design Routes (Protected) =====
  app.get("/api/designs", verifyToken, handleGetDesigns);
  app.get("/api/orders/:orderId/designs", verifyToken, handleGetOrderDesigns);
  app.post("/api/designs/upload", verifyToken, handleUploadDesignFile);

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
  // NOTE: More specific routes MUST come first, or they will be caught by the generic route!
  app.get("/api/public/products/admin/:id", handleGetAdminProductPublic);
  app.get("/api/public/products/imported/:id", handleGetImportedProductPublic);
  app.get("/api/public/products/:productId", handleGetPublicProduct);

  // ===== Product Reviews Routes (Public) =====
  app.post("/api/reviews", handleSubmitReview);
  app.get("/api/reviews/:productId", handleGetProductReviews);
  app.post("/api/reviews/:reviewId/helpful", handleMarkReviewHelpful);

  // ===== Admin Reviews Routes (Protected - Admin only) =====
  app.get(
    "/api/admin/reviews",
    verifyToken,
    requireAdmin,
    handleGetAdminReviews,
  );
  app.patch(
    "/api/admin/reviews/:reviewId/status",
    verifyToken,
    requireAdmin,
    handleUpdateReviewStatus,
  );
  app.delete(
    "/api/admin/reviews/:reviewId",
    verifyToken,
    requireAdmin,
    handleDeleteReview,
  );

  // ===== Ecwid Products Routes (Public) =====
  // Note: Order matters! More specific routes first
  app.get("/api/ecwid-products/search", handleSearchEcwidProducts);
  app.get("/api/ecwid-products/:productId", handleGetEcwidProduct);
  app.get("/api/ecwid-products", handleListEcwidProducts);

  // ===== Imported Products Routes =====
  app.get("/api/imported-products", handleGetProducts);
  app.post(
    "/api/import-products",
    verifyToken,
    requireAdmin,
    handleImportProducts,
  );
  app.delete(
    "/api/imported-products/all",
    verifyToken,
    requireAdmin,
    handleDeleteAllProducts,
  );

  // ===== Storefront Products Routes (Public - merged admin + imported) =====
  app.get("/api/storefront/products", handleGetStorefrontProducts);

  // ===== Payments Routes (Public) =====
  app.get("/api/payments/methods", handleGetPaymentMethods);
  app.post("/api/payments/process", paymentLimiter, handleProcessPayment);

  // ===== Square Payment Routes (Public) =====
  app.get("/api/square/config", handleGetSquareConfig);
  app.get("/api/square/locations", handleGetSquareLocations);
  app.get("/api/square/test", handleTestSquareConfig);
  app.post(
    "/api/square/checkout",
    checkoutLimiter,
    handleCreateCheckoutSession,
  );
  app.post(
    "/api/square/confirm-checkout",
    paymentLimiter,
    handleConfirmCheckout,
  );
  app.post("/api/square/pay", paymentLimiter, handleSquarePayment);
  app.post("/api/square/process-payment", paymentLimiter, processSquarePayment);
  app.post("/api/square/create-payment", paymentLimiter, handleCreatePayment);
  app.post("/api/webhooks/square", handleSquareWebhook);
  app.post(
    "/api/admin/verify-payment/:orderId",
    verifyToken,
    requireAdmin,
    handleVerifyPendingPayment,
  );

  // ===== Admin Routes (Protected - Admin only) =====
  app.get(
    "/api/admin/orders/:orderId",
    verifyToken,
    requireAdmin,
    handleGetOrderDetail,
  );
  app.get(
    "/api/admin/customers",
    verifyToken,
    requireAdmin,
    handleGetAllCustomers,
  );
  app.get(
    "/api/admin/customers/search",
    verifyToken,
    requireAdmin,
    handleSearchCustomers,
  );
  app.get(
    "/api/admin/customers/:customerId",
    verifyToken,
    requireAdmin,
    handleGetCustomerDetails,
  );
  app.get(
    "/api/admin/analytics",
    verifyToken,
    requireAdmin,
    handleGetAnalytics,
  );
  app.post("/api/analytics/track", handleTrackEvent);
  app.get("/api/admin/finance", verifyToken, requireAdmin, handleGetFinance);

  // ===== Admin Products Routes (Protected - Admin only) =====
  // NOTE: More specific routes must come BEFORE parameterized routes!
  app.post("/api/products", verifyToken, requireAdmin, handleCreateProduct);
  app.put(
    "/api/products/:productId",
    verifyToken,
    requireAdmin,
    handleUpdateProduct,
  );
  app.get(
    "/api/admin/products",
    verifyToken,
    requireAdmin,
    handleGetAdminProducts,
  );
  app.post(
    "/api/admin/products/import",
    verifyToken,
    requireAdmin,
    handleImportAdminProduct,
  );
  app.get(
    "/api/admin/products/:productId",
    verifyToken,
    requireAdmin,
    handleGetAdminProduct,
  );
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
  app.post(
    "/api/store-credit/modify",
    verifyToken,
    requireAdmin,
    handleModifyStoreCredit,
  );
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
  app.get(
    "/api/admin/tickets",
    verifyToken,
    requireAdmin,
    handleAdminGetAllTickets,
  );
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
  // New proof routes for public approval page
  app.get("/api/proofs/:proofId/public", handleGetProofDetailPublic);
  app.post("/api/proofs/:proofId/approve", handleApproveProofPublicNew);
  app.post("/api/proofs/:proofId/revise", handleReviseProofPublicNew);
  app.post(
    "/api/admin/proofs/send",
    verifyToken,
    requireAdmin,
    handleSendProofToCustomer,
  );
  app.get("/api/admin/proofs", verifyToken, requireAdmin, handleGetAdminProofs);
  app.get(
    "/api/admin/proofs/:proofId",
    verifyToken,
    requireAdmin,
    handleGetAdminProofDetail,
  );
  app.post(
    "/api/admin/proofs/:proofId/comments",
    verifyToken,
    requireAdmin,
    handleAddAdminProofComment,
  );
  app.post(
    "/api/send-proof",
    verifyToken,
    requireAdmin,
    handleSendProofDirectly,
  );
  app.get("/api/email-preview/proof", handleProofEmailPreview);
  app.post("/api/email-preview/send", handleSendProofEmailPreview);
  app.get("/api/email-preview/signup", handleSignupConfirmationPreview);
  app.get(
    "/api/email-preview/order-confirmation",
    handleOrderConfirmationPreview,
  );
  app.get("/api/email-preview/shipping", handleShippingConfirmationPreview);
  app.get("/api/email-preview/password-reset", handlePasswordResetPreview);
  app.get("/api/email-preview/support-reply", handleSupportTicketReplyPreview);
  app.get(
    "/api/email-preview/order-status-update",
    handleOrderStatusUpdatePreview,
  );
  app.get(
    "/api/admin/pending-orders",
    verifyToken,
    requireAdmin,
    handleGetAdminPendingOrders,
  );
  app.get(
    "/api/admin/orders/test",
    verifyToken,
    requireAdmin,
    handleTestAdminOrders,
  );
  app.get(
    "/api/admin/orders/debug",
    verifyToken,
    requireAdmin,
    handleDebugOrders,
  );
  app.get(
    "/api/admin/all-orders",
    verifyToken,
    requireAdmin,
    handleGetAllAdminOrders,
  );
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
  app.post(
    "/api/admin/update-order-item-options",
    verifyToken,
    requireAdmin,
    handleUpdateOrderItemOptions,
  );

  // ===== Shipping Routes (Protected - admin only) =====
  app.post("/api/shipping/label", verifyToken, requireAdmin, handleCreateLabel);
  app.post("/api/shipping/rates", verifyToken, requireAdmin, handleGetRates);
  app.get(
    "/api/shipping/carriers",
    verifyToken,
    requireAdmin,
    handleGetCarriers,
  );
  app.get(
    "/api/shipping/services",
    verifyToken,
    requireAdmin,
    handleGetServices,
  );

  // ===== Shipping Options Routes (Public - for checkout) =====
  app.get("/api/shipping-options", handleGetPublicShippingOptions);

  // ===== Shipping Options Routes (Protected - admin only) =====
  app.get(
    "/api/admin/shipping-options",
    verifyToken,
    requireAdmin,
    handleGetShippingOptions,
  );
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

  // ===== Discount Code Routes (Public validation) =====
  app.post("/api/discounts/validate", handleValidateDiscountCode);
  app.post("/api/discounts/apply", handleApplyDiscountCode);

  // ===== Discount Code Routes (Protected - admin only) =====
  app.get(
    "/api/admin/discounts",
    verifyToken,
    requireAdmin,
    handleGetDiscountCodes,
  );
  app.get(
    "/api/admin/discounts/:id",
    verifyToken,
    requireAdmin,
    handleGetDiscountCode,
  );
  app.post(
    "/api/admin/discounts",
    verifyToken,
    requireAdmin,
    handleCreateDiscountCode,
  );
  app.put(
    "/api/admin/discounts/:id",
    verifyToken,
    requireAdmin,
    handleUpdateDiscountCode,
  );
  app.delete(
    "/api/admin/discounts/:id",
    verifyToken,
    requireAdmin,
    handleDeleteDiscountCode,
  );

  // ===== Webhook Routes =====
  app.post("/api/webhooks/ecwid", handleEcwidOrderWebhook);
  app.get("/api/webhooks/health", handleWebhookHealth);
  app.get("/api/webhooks/url", handleGetWebhookUrl);
  app.get(
    "/api/webhooks/diagnostic",
    verifyToken,
    requireAdmin,
    handleEcwidDiagnostic,
  );
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
  app.get(
    "/api/admin/blogs/:blogId",
    verifyToken,
    requireAdmin,
    handleGetAdminBlogById,
  );
  app.put(
    "/api/admin/blogs/:blogId",
    verifyToken,
    requireAdmin,
    handleUpdateBlog,
  );
  app.delete(
    "/api/admin/blogs/:blogId",
    verifyToken,
    requireAdmin,
    handleDeleteBlog,
  );
  app.post(
    "/api/admin/upload-image",
    verifyToken,
    requireAdmin,
    upload.single("file"),
    handleUploadBlogImage,
  );

  // ===== Gallery Routes =====
  app.use("/api", adminGalleryRouter);

  // Gallery image upload (with multer middleware)
  app.post(
    "/api/gallery/upload",
    verifyToken,
    requireAdmin,
    upload.single("file"),
    async (req: any, res: any) => {
      try {
        const { v2: cloudinary } = await import("cloudinary");
        const { processImage: processImageUtil } = await import(
          "../server/utils/image-processor"
        );

        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        if (!req.file) {
          return res.status(400).json({ error: "No file provided" });
        }

        // Compress and optimize image (uses sharp if available, falls back to original)
        const compressedBuffer = await processImageUtil(
          req.file.buffer,
          1200,
          800,
        );

        const b64 = compressedBuffer.toString("base64");
        const dataURI = `data:image/jpeg;base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "sticky-slap/gallery",
          resource_type: "auto",
        });

        res.json({ imageUrl: result.secure_url });
      } catch (err) {
        console.error("Error uploading gallery image:", err);
        res.status(500).json({ error: "Failed to upload gallery image" });
      }
    },
  );

  // ===== Legal Pages Routes =====
  // Public routes
  app.get("/api/legal-pages", handleGetPublishedLegalPages);
  app.get("/api/legal/:pageType", handleGetLegalPageByType);

  // Admin routes (Protected - Admin only)
  app.post(
    "/api/admin/legal-pages",
    verifyToken,
    requireAdmin,
    handleCreateLegalPage,
  );
  app.get(
    "/api/admin/legal-pages",
    verifyToken,
    requireAdmin,
    handleGetAllLegalPages,
  );
  app.get(
    "/api/admin/legal-pages/:pageId",
    verifyToken,
    requireAdmin,
    handleGetAdminLegalPageById,
  );
  app.put(
    "/api/admin/legal-pages/:pageId",
    verifyToken,
    requireAdmin,
    handleUpdateLegalPage,
  );
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

  // ===== Invoice Routes =====
  // Admin routes (Protected - Admin only)
  app.get("/api/admin/invoices", verifySupabaseToken, handleGetInvoices);
  app.get("/api/admin/invoices/:id", verifySupabaseToken, handleGetInvoice);
  app.post("/api/admin/invoices", verifySupabaseToken, handleCreateInvoice);
  app.put("/api/admin/invoices/:id", verifySupabaseToken, handleUpdateInvoice);
  app.post(
    "/api/admin/invoices/:id/send",
    verifySupabaseToken,
    handleSendInvoice,
  );
  app.post(
    "/api/admin/invoices/:id/mark-paid",
    verifySupabaseToken,
    handleMarkInvoicePaid,
  );
  app.post(
    "/api/admin/invoices/:id/cancel",
    verifySupabaseToken,
    handleCancelInvoice,
  );
  app.get(
    "/api/admin/invoices/:invoiceId/payment-token",
    verifyToken,
    requireAdmin,
    handleGetPaymentToken,
  );

  // Artwork upload routes
  app.post(
    "/api/admin/invoices/:invoiceId/artwork",
    verifySupabaseToken,
    uploadMiddleware.single("file"),
    handleUploadArtwork,
  );
  app.get(
    "/api/admin/invoices/:invoiceId/artwork",
    verifySupabaseToken,
    handleGetArtwork,
  );
  app.delete(
    "/api/admin/invoices/artwork/:artworkId",
    verifySupabaseToken,
    handleDeleteArtwork,
  );

  // Public routes
  app.get("/api/invoice/:token", handleGetInvoiceByToken);
  app.post(
    "/api/invoice/:token/create-payment-link",
    handleCreateInvoicePaymentLink,
  );

  // Database setup route
  app.post(
    "/api/admin/setup/init-invoices",
    requireAdmin,
    handleInitializeInvoicesDatabase,
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
