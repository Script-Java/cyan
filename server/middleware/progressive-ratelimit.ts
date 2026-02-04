import { Request, Response, NextFunction } from "express";

/**
 * Progressive Rate Limiting with Tiered Backoff and Lockouts
 *
 * STRATEGY:
 * Tier 1 (0-5 attempts):   Normal - No penalty
 * Tier 2 (6-10 attempts):  Elevated - 500ms delay
 * Tier 3 (11-20 attempts): Attack - 2s delay + CAPTCHA
 * Tier 4 (20+ attempts):   Confirmed - 1hr lockout
 *
 * This makes attacks progressively more expensive while not affecting
 * legitimate users (who succeed on first attempt)
 */

export enum RateLimitTier {
  NORMAL = 1,
  ELEVATED = 2,
  ATTACK = 3,
  LOCKOUT = 4,
}

export interface RateLimitEntry {
  count: number;
  tier: RateLimitTier;
  firstAttemptTime: number;
  lastAttemptTime: number;
  lockedUntil?: number;
  failures: number;
  successes: number;
}

export interface RateLimitConfig {
  tier1Limit?: number; // Normal tier limit (default: 5)
  tier2Limit?: number; // Elevated tier limit (default: 10)
  tier3Limit?: number; // Attack tier limit (default: 20)
  tier1Delay?: number; // Normal delay (default: 0ms)
  tier2Delay?: number; // Elevated delay (default: 500ms)
  tier3Delay?: number; // Attack delay (default: 2000ms)
  lockoutDurationMs?: number; // Lockout duration (default: 3600000ms = 1 hour)
  windowMs?: number; // Time window for rate limiting (default: 900000ms = 15 min)
  keyPrefix?: string; // Prefix for rate limit keys
  storage?: Map<string, RateLimitEntry>; // Custom storage (default: in-memory)
}

/**
 * In-memory rate limit storage
 * For production, replace with Redis or similar
 */
class InMemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, value: RateLimitEntry): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entriesToDelete = [];

    for (const [key, entry] of this.store.entries()) {
      // Delete if older than 1 hour and no recent activity
      if (now - entry.lastAttemptTime > 3600000) {
        entriesToDelete.push(key);
      }
    }

    entriesToDelete.forEach((key) => this.store.delete(key));

    if (entriesToDelete.length > 0) {
      console.log(
        `[RATELIMIT] Cleaned up ${entriesToDelete.length} expired entries`,
      );
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export class ProgressiveRateLimiter {
  private config: Required<RateLimitConfig>;
  private store: Map<string, RateLimitEntry>;

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      tier1Limit: config.tier1Limit || 5,
      tier2Limit: config.tier2Limit || 10,
      tier3Limit: config.tier3Limit || 20,
      tier1Delay: config.tier1Delay || 0,
      tier2Delay: config.tier2Delay || 500,
      tier3Delay: config.tier3Delay || 2000,
      lockoutDurationMs: config.lockoutDurationMs || 3600000,
      windowMs: config.windowMs || 900000,
      keyPrefix: config.keyPrefix || "rl:",
      storage: config.storage || (new InMemoryRateLimitStore() as any),
    };

    this.store = this.config.storage;
  }

  /**
   * Check rate limit and return tier + delay
   *
   * @param key - Rate limit key (IP, identifier, etc.)
   * @returns { allowed: boolean, tier: RateLimitTier, delayMs: number }
   */
  check(key: string): {
    allowed: boolean;
    tier: RateLimitTier;
    delayMs: number;
    lockedUntil?: number;
    reason?: string;
  } {
    const fullKey = this.config.keyPrefix + key;
    const now = Date.now();

    let entry = this.store.get(fullKey);

    // Check if currently locked out
    if (entry && entry.lockedUntil && now < entry.lockedUntil) {
      return {
        allowed: false,
        tier: RateLimitTier.LOCKOUT,
        delayMs: 0,
        lockedUntil: entry.lockedUntil,
        reason: "IP is temporarily locked out",
      };
    }

    // Create new entry if doesn't exist
    if (!entry) {
      entry = {
        count: 0,
        tier: RateLimitTier.NORMAL,
        firstAttemptTime: now,
        lastAttemptTime: now,
        failures: 0,
        successes: 0,
      };
    }

    // Reset if outside of window
    const timeSinceFirst = now - entry.firstAttemptTime;
    if (timeSinceFirst > this.config.windowMs) {
      entry = {
        count: 0,
        tier: RateLimitTier.NORMAL,
        firstAttemptTime: now,
        lastAttemptTime: now,
        failures: 0,
        successes: 0,
      };
    }

    // Increment attempt count
    entry.count++;
    entry.lastAttemptTime = now;

    // Determine tier based on count
    let tier = RateLimitTier.NORMAL;
    let delayMs = this.config.tier1Delay;
    let allowed = true;

    if (entry.count > this.config.tier3Limit) {
      tier = RateLimitTier.LOCKOUT;
      allowed = false;
      entry.lockedUntil = now + this.config.lockoutDurationMs;
    } else if (entry.count > this.config.tier2Limit) {
      tier = RateLimitTier.ATTACK;
      delayMs = this.config.tier3Delay;
      allowed = entry.count <= this.config.tier3Limit + 2; // Allow 2 more then lock
    } else if (entry.count > this.config.tier1Limit) {
      tier = RateLimitTier.ELEVATED;
      delayMs = this.config.tier2Delay;
      allowed = true;
    }

    // Save updated entry
    this.store.set(fullKey, entry);

    return {
      allowed,
      tier,
      delayMs,
      lockedUntil: entry.lockedUntil,
    };
  }

  /**
   * Record a successful attempt
   * Useful for resetting counter on success
   *
   * @param key - Rate limit key
   * @param resetOnSuccess - Reset counter to 0 on success
   */
  recordSuccess(key: string, resetOnSuccess: boolean = true): void {
    const fullKey = this.config.keyPrefix + key;
    const entry = this.store.get(fullKey);

    if (entry) {
      entry.successes++;

      if (resetOnSuccess) {
        entry.count = 0;
        entry.tier = RateLimitTier.NORMAL;
      }

      this.store.set(fullKey, entry);
    }
  }

  /**
   * Record a failed attempt
   *
   * @param key - Rate limit key
   */
  recordFailure(key: string): void {
    const fullKey = this.config.keyPrefix + key;
    const entry = this.store.get(fullKey);

    if (entry) {
      entry.failures++;
      this.store.set(fullKey, entry);
    }
  }

  /**
   * Get current status for a key
   *
   * @param key - Rate limit key
   * @returns Current limit status
   */
  getStatus(key: string): RateLimitEntry | null {
    const fullKey = this.config.keyPrefix + key;
    return this.store.get(fullKey) || null;
  }

  /**
   * Reset a key's rate limit
   *
   * @param key - Rate limit key
   */
  reset(key: string): void {
    const fullKey = this.config.keyPrefix + key;
    this.store.delete(fullKey);
  }

  /**
   * Get all entries (for monitoring/debugging)
   *
   * @returns All stored entries
   */
  getAll(): Map<string, RateLimitEntry> {
    return new Map(this.store);
  }
}

/**
 * Create Express middleware from ProgressiveRateLimiter
 *
 * Usage:
 * ```typescript
 * const limiter = new ProgressiveRateLimiter();
 * router.post('/api/verify', createProgressiveRateLimitMiddleware(limiter, 'ip'), handler);
 * ```
 */
export function createProgressiveRateLimitMiddleware(
  limiter: ProgressiveRateLimiter,
  keyFn: string | ((req: Request) => string),
) {
  const getKey =
    typeof keyFn === "string"
      ? (req: Request) => req.ip || req.socket.remoteAddress || "unknown"
      : keyFn;

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = getKey(req);
    const check = limiter.check(key);

    // Store limit info on request for later use
    (req as any).rateLimit = {
      allowed: check.allowed,
      tier: check.tier,
      delayMs: check.delayMs,
    };

    // If locked out, return 429
    if (!check.allowed && check.tier === RateLimitTier.LOCKOUT) {
      console.warn(`[RATELIMIT] Lockout enforced for key: ${key}`);
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    // Apply delay if needed
    if (check.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, check.delayMs));
    }

    // Intercept response to update limiter on success
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // If response indicates success, reset counter
      if (data && data.success) {
        limiter.recordSuccess(key, true);
      } else if (data && data.error) {
        limiter.recordFailure(key);
      }

      return originalJson.call(res, data);
    } as any;

    next();
  };
}

/**
 * Middleware factory for identifier-based rate limiting
 *
 * Useful for limiting per-order, per-email, etc.
 * In addition to IP-based limiting
 *
 * Usage:
 * ```typescript
 * router.post('/api/verify',
 *   createProgressiveRateLimitMiddleware(ipLimiter, 'ip'),
 *   createIdentifierRateLimitMiddleware(idLimiter, (req) => req.body.order_number),
 *   handler
 * );
 * ```
 */
export function createIdentifierRateLimitMiddleware(
  limiter: ProgressiveRateLimiter,
  identifierFn: (req: Request) => string,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = identifierFn(req);
    if (!identifier) {
      return next(); // No identifier, skip this check
    }

    const check = limiter.check(`id:${identifier}`);

    // If identifier-level rate limit exceeded, block
    if (!check.allowed && check.tier === RateLimitTier.LOCKOUT) {
      console.warn(`[RATELIMIT] Identifier lockout: ${identifier}`);
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    // Store identifier-level info
    (req as any).idRateLimit = {
      allowed: check.allowed,
      tier: check.tier,
      delayMs: check.delayMs,
    };

    // Apply identifier-level delay
    if (check.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, check.delayMs));
    }

    next();
  };
}
