import { Router } from "express";
import {
  handleLogin,
  handleSignup,
  handleLogout,
  handleAdminSetup,
  handleRequestPasswordReset,
  handleResetPassword,
} from "./auth";
import { authLimiter } from "../middleware/rate-limit";

/**
 * Authentication Routes
 * Handles user login, signup, password reset, and admin setup
 */
export function createAuthRouter() {
  const router = Router();

  // POST /api/auth/login - User login
  router.post("/login", authLimiter, handleLogin);

  // POST /api/auth/signup - User registration
  router.post("/signup", authLimiter, handleSignup);

  // POST /api/auth/logout - User logout
  router.post("/logout", handleLogout);

  // POST /api/auth/admin-setup - Initial admin setup
  router.post("/admin-setup", authLimiter, handleAdminSetup);

  // POST /api/auth/request-password-reset - Request password reset
  router.post("/request-password-reset", authLimiter, handleRequestPasswordReset);

  // POST /api/auth/reset-password - Reset password with token
  router.post("/reset-password", handleResetPassword);

  return router;
}
