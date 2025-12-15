import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
let expressAppLoading: Promise<any> | null = null;

function getExpressApp() {
  if (cachedExpressApp) {
    return Promise.resolve(cachedExpressApp);
  }
  if (expressAppLoading) {
    return expressAppLoading;
  }

  expressAppLoading = import("./server")
    .then(({ createServer }) => {
      cachedExpressApp = createServer();
      console.log("✅ Express server app loaded");
      return cachedExpressApp;
    })
    .catch((err) => {
      console.error("❌ Failed to load Express server:", err);
      expressAppLoading = null;
      throw err;
    });

  return expressAppLoading;
}

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      // Pre-load the Express app
      await getExpressApp().catch((err) => {
        console.error("Failed to pre-load Express app:", err);
      });

      // Return a middleware that runs BEFORE Vite's default handlers
      // Note: returning middleware here makes it run as a "pre" hook
      return (middlewares, server) => {
        middlewares.unshift({
          // Custom connect middleware for API routes
          handle: async (req: any, res: any, next: any) => {
            // Only intercept API and health routes
            if (!req.url.startsWith("/api/") && req.url !== "/health") {
              return next();
            }

            try {
              const app = await getExpressApp();
              return app(req, res, next);
            } catch (err) {
              console.error("Error in API handler:", err);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Server initialization failed" }));
            }
          },
        });
      };
    },
  };
}
