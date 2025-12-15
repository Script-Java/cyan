// Log immediately to verify script is running
console.log("🚀 Starting server...");
console.log("📦 Node version:", process.version);
console.log("🌍 NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("🔌 PORT:", process.env.PORT || "3000 (default)");

import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import * as express from "express";

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit in production, just log
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("Stack:", error.stack);
  // Don't exit immediately - let the server try to handle it
});

const port = parseInt(process.env.PORT || "3000", 10);
console.log("🔢 Parsed port:", port);

console.log("📥 Importing createServer...");
let app;
try {
  // Import createServer - this should work synchronously in the built output
  const { createServer } = await import("./index");
  console.log("✅ createServer imported successfully");
  app = createServer();
  console.log("✅ Server created successfully");
} catch (error) {
  console.error("❌ Failed to create server:", error);
  console.error(
    "Error type:",
    error instanceof Error ? error.constructor.name : typeof error,
  );
  console.error(
    "Stack:",
    error instanceof Error ? error.stack : "No stack trace",
  );
  process.exit(1);
}

// In production, serve the built SPA files
// Use fileURLToPath for reliable path resolution in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../spa");

console.log("📁 Server directory:", __dirname);
console.log("📁 SPA directory:", distPath);
console.log("📁 SPA directory exists:", existsSync(distPath));

// Serve static files
if (existsSync(distPath)) {
  app.use(express.static(distPath, { index: false }));
  console.log("✅ Static files will be served from:", distPath);
} else {
  console.warn("⚠️  SPA directory not found:", distPath);
}

// Handle React Router - serve index.html for all non-API routes
// IMPORTANT: This catch-all must come AFTER all API routes are registered
// The health endpoint is defined in server/index.ts and should be matched first
app.get("*", (req, res, next) => {
  // Skip API routes and health check - let Express handle these
  if (req.path.startsWith("/api/") || req.path === "/health") {
    // Pass to next handler (should be 404 if route doesn't exist)
    return next();
  }

  const indexPath = path.join(distPath, "index.html");
  if (!existsSync(indexPath)) {
    console.error("❌ index.html not found at:", indexPath);
    return res.status(500).json({
      error: "Frontend not built",
      path: indexPath,
      distPath: distPath,
    });
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Internal server error");
    }
  });
});

// Error handling for server startup
console.log("🎯 Attempting to start server on 0.0.0.0:" + port);
let server;
try {
  server = app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Fusion Starter server running on port ${port}`);
    console.log(`📱 Frontend: http://0.0.0.0:${port}`);
    console.log(`🔧 API: http://0.0.0.0:${port}/api`);
    console.log(`❤️  Health: http://0.0.0.0:${port}/health`);
    console.log(`✅ Server started successfully and is listening`);

    // Verify the server is actually listening
    const address = server.address();
    console.log("📍 Server address:", address);
  });

  server.on("error", (err: any) => {
    console.error("❌ Server error:", err);
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use`);
    }
    process.exit(1);
  });

  // Add a listener to verify the server is listening
  server.on("listening", () => {
    const addr = server.address();
    console.log("✅ Server is now listening on:", addr);
  });
} catch (error) {
  console.error("❌ Failed to start server:", error);
  console.error(
    "Stack:",
    error instanceof Error ? error.stack : "No stack trace",
  );
  process.exit(1);
}

// Keep the process alive
console.log("💓 Process PID:", process.pid);
console.log("⏰ Process uptime:", process.uptime());

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  if (server) {
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  if (server) {
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Log that we're ready
console.log("✅ Server startup script completed, process should stay alive");
