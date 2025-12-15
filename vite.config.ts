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
      // Load Express app and attach it to middleware
      // The dynamic import ensures server code is not evaluated during build
      import("./server")
        .then(({ createServer }) => {
          const app = createServer();
          server.middlewares.use(app);
          console.log("✅ Express server loaded and attached to dev server");
        })
        .catch((err) => {
          console.error("❌ Failed to load Express server:", err);
        });
    },
  };
}
