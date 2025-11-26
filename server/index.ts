import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleLogin,
  handleSignup,
  handleBigCommerceAuth,
  handleBigCommerceCallback,
  handleLogout,
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/signup", handleSignup);
  app.get("/api/auth/bigcommerce", handleBigCommerceAuth);
  app.get("/api/auth/bigcommerce/callback", handleBigCommerceCallback);
  app.post("/api/auth/logout", handleLogout);
  app.get("/api/auth/bigcommerce/signup", handleBigCommerceAuth);

  return app;
}
