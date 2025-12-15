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

// Global to cache Express app instance
let expressApp: any = null;
let expressAppLoading: Promise<any> | null = null;

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      // Pre-load the Express app synchronously
      if (!expressAppLoading) {
        expressAppLoading = import("./server")
          .then(({ createServer }) => {
            expressApp = createServer();
            console.log("✅ Express server initialized");
            return expressApp;
          })
          .catch((err) => {
            console.error("❌ Failed to load Express server:", err);
            throw err;
          });
      }

      // Return a middleware that will use the loaded Express app
      return () => {
        server.middlewares.use(async (req, res, next) => {
          if (!expressApp) {
            try {
              await expressAppLoading;
            } catch (err) {
              console.error("❌ Express app failed to load:", err);
              return res.status(500).json({ error: "Server initialization failed" });
            }
          }
          expressApp(req, res, next);
        });
      };
    },
  };
}
