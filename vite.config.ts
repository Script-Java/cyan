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

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      // Important: This is a sync function, but we need to handle async import
      // The server.middlewares.use() is called immediately with a middleware function
      // that will handle the dynamic import when first called
      return () => {
        // This function is called for each request, ensuring Express server is loaded
        // Load Express app synchronously on first request
        if (!expressAppInstance) {
          throw new Error("Express app not yet initialized");
        }
        server.middlewares.use(expressAppInstance);
      };
    },
  };
}

// Global variable to hold the Express app instance
let expressAppInstance: any;

// Load Express server immediately
import("./server")
  .then(({ createServer }) => {
    expressAppInstance = createServer();
    console.log("✅ Express server loaded for dev mode");
  })
  .catch((err) => {
    console.error("❌ Failed to load Express server:", err);
  });
