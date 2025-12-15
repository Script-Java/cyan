import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

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
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, "index.html");
  if (!existsSync(indexPath)) {
    console.error("❌ index.html not found at:", indexPath);
    return res.status(500).json({ 
      error: "Frontend not built", 
      path: indexPath,
      distPath: distPath 
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
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://0.0.0.0:${port}`);
  console.log(`🔧 API: http://0.0.0.0:${port}/api`);
  console.log(`❤️  Health: http://0.0.0.0:${port}/health`);
});

server.on("error", (err: any) => {
  console.error("❌ Server error:", err);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
