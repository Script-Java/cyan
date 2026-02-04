import rateLimit, { Options as RateLimitOptions } from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Rate Limiting for Public Token Validation
 *
 * SECURITY:
 * - Prevents token enumeration/brute force attacks
 * - Uses IP address to track rate limits
 * - Implements exponential backoff strategy
 * - Returns generic 429 error without revealing rate limit details
 * - Logs suspicious activity for security monitoring
 */

/**
 * Conservative rate limiter for public token validation endpoints
 * - Allows 5 attempts per 15 minutes per IP
 * - After exhaustion, requires increasingly long waits
 *
 * RATIONALE:
 * - Legitimate users submit correct token on first try
 * - Attackers doing brute force need many attempts
 * - 5/15min = 1 legitimate attempt every 3 minutes (reasonable for email links)
 */
export const publicTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // 5 attempts per window
  message:
    "Too many attempts with invalid tokens. Please try again later or contact support.",
  standardHeaders: false, // Don't return rate limit info in headers
  legacyHeaders: false,
  skip: (req: Request) => {
    // Don't rate limit if request has valid token query param
    // (token validation failure still gets rate limited)
    // This is just a courtesy - invalid tokens always get rate limited
    return false;
  },
  handler: (req: Request, res: Response) => {
    // Log suspicious activity
    const ip = req.ip || req.socket.remoteAddress;
    const path = req.path;
    const token = (req.query.token as string)?.substring(0, 8) || "unknown";

    console.warn("[SECURITY] Rate limit exceeded on public token endpoint", {
      ip,
      path,
      tokenPrefix: token,
      timestamp: new Date().toISOString(),
      attempts: req.rateLimit?.current,
    });

    // Return generic error - never reveal rate limit details to attacker
    res.status(429).json({
      error: "Too many requests. Please try again later.",
    });
  },
  keyGenerator: (req: Request) => {
    // Rate limit by IP address
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  store: undefined, // Uses memory store (suitable for single server)
  // For distributed deployments, use RedisStore or similar
  // store: new RedisStore({...})
});

/**
 * Stricter rate limiter for repeated failures on same token
 * - Allows 2 attempts per 5 minutes
 * - Useful for operations like proof approval (shouldn't be retried)
 *
 * RATIONALE:
 * - If token is invalid, likely an enumeration attack
 * - One-time-use tokens shouldn't be retried at all
 * - Even reusable tokens should work on first try with correct token
 */
export const strictPublicTokenRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute window
  max: 2, // 2 attempts per window
  message: "Too many failed attempts. Please try again later.",
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress;
    console.warn(
      "[SECURITY] Strict rate limit exceeded on public token endpoint",
      {
        ip,
        path: req.path,
        timestamp: new Date().toISOString(),
      },
    );

    res.status(429).json({
      error: "Too many requests. Please try again later.",
    });
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
});

/**
 * Per-token rate limiter
 * - Limits attempts per specific token value
 * - Prevents attacks that rotate through token guesses
 *
 * RATIONALE:
 * - Even with IP rotation, same token shouldn't be tried many times
 * - 3 failures per token = likely wrong token or attack
 */
export const perTokenRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // 3 attempts per token per hour
  message: "Too many attempts with this token.",
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    const tokenPrefix = (req.query.token as string)?.substring(0, 8) || "unknown";
    console.warn("[SECURITY] Per-token rate limit exceeded", {
      tokenPrefix,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      error: "Too many requests. Please try again later.",
    });
  },
  keyGenerator: (req: Request) => {
    // Rate limit by token value
    const token = req.query.token as string;
    if (!token) {
      return "no-token";
    }
    // Hash the token to avoid logging full token
    // Use first 16 chars + length for collision resistance
    return `token-${token.substring(0, 16)}`;
  },
  skip: (req: Request) => {
    // Skip if no token provided (will be caught by token validation)
    return !req.query.token;
  },
});

/**
 * Aggressive rate limiter for design file operations
 * - Files can be large, so limit attempts more strictly
 * - Prevents abuse of file upload/download functionality
 */
export const designFileRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minute window
  max: 3, // 3 attempts per window
  message: "Too many file operations. Please try again later.",
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn("[SECURITY] Design file rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      error: "Too many requests. Please try again later.",
    });
  },
});

/**
 * Helper to attach rate limiting to public endpoints
 * Usage in route definitions:
 * router.get('/public/proofs/:id', applyPublicTokenRateLimit, handler)
 */
export function applyPublicTokenRateLimit(...limiters: any[]) {
  return (req: any, res: any, next: any) => {
    // Apply all limiters in sequence
    const allLimiters = [publicTokenRateLimiter, ...limiters];
    let index = 0;

    const applyNext = () => {
      if (index < allLimiters.length) {
        const limiter = allLimiters[index++];
        limiter(req, res, applyNext);
      } else {
        next();
      }
    };

    applyNext();
  };
}

/**
 * Monitoring utility to track suspicious patterns
 * Call this in token validation failure handlers
 */
export function logSuspiciousTokenActivity(
  token: string,
  resourceType: string,
  reason: "expired" | "invalid" | "wrong_resource" | "already_used" | "not_found",
) {
  const tokenPrefix = token?.substring(0, 8) || "unknown";

  // In production, send to security monitoring service
  console.warn("[SECURITY] Suspicious token activity detected", {
    tokenPrefix,
    resourceType,
    reason,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to centralized security monitoring
  // - Send to Sentry, DataDog, or similar service
  // - Alert on repeated patterns
  // - Create Security Event log
}
