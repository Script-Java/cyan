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
      // Load Express app and attach it to middleware with better error handling
      // The dynamic import ensures server code is not evaluated during build
      import("./server")
        .then(({ createServer }) => {
          try {
            const app = createServer();
            // Use unshift to add to the beginning of middleware stack for priority
            server.middlewares.stack.unshift({
              route: "",
              handle: app
            });
            console.log("✅ Express server loaded and attached to dev server middleware stack");
          } catch (err) {
            console.error("❌ Failed to create Express app:", err);
          }
        })
        .catch((err) => {
          console.error("❌ Failed to import server module:", err);
        });
    },
  };
}
