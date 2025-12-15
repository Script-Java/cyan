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
  plugins: [react(), expressPlugin(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(mode: string): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // Dynamic import to avoid evaluating server code during build
      // This only runs in serve mode, so it's safe to import here
      try {
        const { createServer } = await import("./server");
        const app = createServer();
        // Return middleware to be applied in the correct order
        return () => {
          server.middlewares.use(app);
        };
      } catch (err) {
        console.warn("Failed to load Express server:", err);
      }
    },
  };
}
