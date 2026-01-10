import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
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
    configureServer(server) {
      // Load and set up Express app to handle API requests
      // This middleware will run BEFORE Vite's default handlers
      import("./server")
        .then(({ createServer }) => {
          cachedExpressApp = createServer();
          console.log("✅ Express server initialized");
          // Prepend to middleware stack to run before Vite's handlers
          // Using the internal connect middleware stack
          const expressMiddleware = cachedExpressApp;
          server.middlewares.stack.unshift({
            route: "",
            handle: expressMiddleware,
          });
          console.log("✅ Express middleware added to Vite dev server");
        })
        .catch((err) => {
          console.error("❌ Failed to load Express server:", err);
          process.exit(1);
        });
    },
  };
}
