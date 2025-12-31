import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * 15 minutes window, max 100 requests per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP address, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and webhook endpoints
    return req.path === "/health" || req.path.includes("/webhooks/");
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 15 minutes window, max 5 login/signup attempts per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many login/signup attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
});

/**
 * Strict rate limiter for payment endpoints
 * 5 minutes window, max 10 payment attempts per IP
 */
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many payment attempts. Please try again after 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate rate limiter for checkout endpoints
 * 5 minutes window, max 20 checkout attempts per IP
 */
export const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: "Too many checkout attempts. Please try again after 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin rate limiter
 * 5 minutes window, max 50 requests per IP for admin operations
 */
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many admin operations. Please try again after 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
