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
    middlewareMode: true,
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
  let app: any;

  return {
    name: "express-plugin",
    apply: "serve",
    async configureServer(server) {
      // Import and create Express app once
      try {
        const { createServer } = await import("./server");
        app = createServer();
      } catch (err) {
        console.error("Failed to load Express server:", err);
        throw err;
      }

      // Return middleware handler
      return () => {
        // Handle API routes and other Express routes
        server.middlewares.use(app);
      };
    },
  };
}
