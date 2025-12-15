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
      // Load and attach Express app to Vite dev server
      import("./server")
        .then(({ createServer }) => {
          const app = createServer();
          // Attach to the beginning of middleware stack for API routes to take priority
          server.middlewares.use(app);
          console.log("✅ Express server successfully loaded and attached");
        })
        .catch((err) => {
          console.error("❌ Failed to load Express server:", err);
          process.exit(1);
        });
    },
  };
}
