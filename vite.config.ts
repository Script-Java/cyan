import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "./server/index";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

// Singleton to hold the Express app
let cachedExpressApp: any = null;

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    // Use transformIndexHtml hook to inject a handler that ensures API routes work
    transformIndexHtml: {
      order: "pre",
      async handler(html, ctx) {
        // Pre-load Express app on first HTML request
        if (!cachedExpressApp) {
          try {
            const { createServer } = await import("./server");
            cachedExpressApp = createServer();
            console.log("✅ Express server loaded for API handling");
          } catch (err) {
            console.error("❌ Failed to load Express server:", err);
          }
        }
        return html;
      },
    },
    configureServer(server) {
      // Return a pre-hook to process API requests before Vite's default handlers
      return () => {
        // Add this as a PRE middleware by returning it from configureServer
        server.middlewares.use(async (req, res, next) => {
          // Only intercept API and health routes
          if (!req.url.startsWith("/api/") && req.url !== "/health") {
            // Let Vite handle non-API requests
            return next();
          }

          // Handle API and health routes with Express
          if (!cachedExpressApp) {
            try {
              const { createServer } = await import("./server");
              cachedExpressApp = createServer();
              console.log("✅ Express app initialized for API request handling");
            } catch (err) {
              console.error("❌ Failed to load Express app:", err);
              res.status(500).json({ error: "Server failed to load" });
              return;
            }
          }

          // Pass to Express
          cachedExpressApp(req, res, next);
        });
      };
    },
  };
}
