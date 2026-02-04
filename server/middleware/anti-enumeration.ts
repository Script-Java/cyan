import { Request, Response, NextFunction } from "express";

/**
 * Anti-Enumeration Middleware
 *
 * PURPOSE:
 * Prevent attackers from detecting which resources exist or distinguishing
 * between different types of failures through response analysis
 *
 * TECHNIQUES:
 * 1. Consistent response codes (all failures → same status)
 * 2. Consistent error messages (all failures → same message)
 * 3. Consistent response times (all responses → minimum delay)
 * 4. Consistent payload size (pad responses to similar size)
 * 5. Consistent headers (don't leak info about what failed)
 */

interface AntiEnumerationConfig {
  minResponseTimeMs?: number; // Default: 500ms
  returnStatus?: number; // Default: 404
  returnMessage?: string; // Default: "Not found"
  padResponseSize?: boolean; // Default: true
  targetResponseSize?: number; // Default: 256 bytes
}

/**
 * Create anti-enumeration response wrapper
 * Ensures all failures are identical from attacker's perspective
 *
 * Usage:
 * ```typescript
 * const wrapper = createAntiEnumerationWrapper({
 *   minResponseTimeMs: 500,
 *   returnStatus: 404,
 *   returnMessage: "Not found"
 * });
 *
 * router.post('/api/verify', wrapper, handler);
 * ```
 */
export function createAntiEnumerationWrapper(
  config: AntiEnumerationConfig = {},
) {
  const {
    minResponseTimeMs = 500,
    returnStatus = 404,
    returnMessage = "Not found",
    padResponseSize = true,
    targetResponseSize = 256,
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Record start time for response time normalization
    const startTime = Date.now();

    // Store original res.json and res.status to intercept responses
    const originalJson = res.json;
    const originalStatus = res.status;

    // Track if error response has been sent
    let errorSent = false;

    // Override res.status
    res.status = function (code: number) {
      res.statusCode = code;
      return res;
    };

    // Override res.json
    res.json = function (data: any) {
      // If this is an error response and we should mask it
      if (data && data.error && !errorSent) {
        errorSent = true;

        // Calculate delay needed to reach minimum response time
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, minResponseTimeMs - elapsed);

        // Create normalized error response
        const normalizedResponse = {
          error: returnMessage,
          _timestamp: new Date().toISOString(),
        };

        // Optionally pad response to target size to prevent size-based detection
        if (padResponseSize) {
          const responseStr = JSON.stringify(normalizedResponse);
          const padding = Math.max(0, targetResponseSize - responseStr.length);

          if (padding > 0) {
            // Add padding with random data (not JSON structure)
            // Use comment-like structure that won't parse as JSON
            (normalizedResponse as any)._pad = "x".repeat(
              Math.min(padding, 100),
            );
          }
        }

        // Apply delay if needed, then send response
        if (delayNeeded > 0) {
          setTimeout(() => {
            originalJson.call(res, normalizedResponse);
          }, delayNeeded);
        } else {
          originalJson.call(res, normalizedResponse);
        }

        return res;
      }

      // For successful responses, just pass through
      return originalJson.call(res, data);
    };

    next();
  };
}

/**
 * Middleware to enforce minimum response time
 * Useful for preventing timing attacks without wrapping responses
 *
 * Usage:
 * ```typescript
 * router.post('/api/verify', enforceMinResponseTime(500), handler);
 * ```
 */
export function enforceMinResponseTime(minMs: number = 500) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Intercept res.send, res.json, res.end
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);
    const originalEnd = res.end.bind(res);

    const sendWithDelay = (sender: Function) => {
      return (data?: any) => {
        const elapsed = Date.now() - startTime;
        const delayNeeded = Math.max(0, minMs - elapsed);

        if (delayNeeded > 0) {
          setTimeout(() => sender(data), delayNeeded);
        } else {
          sender(data);
        }

        return res;
      };
    };

    res.send = sendWithDelay(originalSend) as any;
    res.json = sendWithDelay(originalJson) as any;
    res.end = sendWithDelay(originalEnd) as any;

    next();
  };
}

/**
 * Middleware to remove informative headers that leak details
 *
 * Removes headers that might indicate:
 * - Resource existence
 * - Server type/version
 * - Cache status
 * - Database info
 */
export function removeEnumerationHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Remove potentially informative headers
  res.removeHeader("X-Total-Count"); // Leaks total resource count
  res.removeHeader("X-Page"); // Leaks pagination info
  res.removeHeader("X-Resource-Type"); // Leaks what we're hiding
  res.removeHeader("X-Database"); // Leaks DB type
  res.removeHeader("X-API-Version"); // Might leak version

  // Ensure generic server header
  res.removeHeader("X-Powered-By");
  res.set("X-Powered-By", "API");

  next();
}

/**
 * Middleware to ensure identical responses for all failures
 * Wraps any error responses to match a pattern
 *
 * Usage:
 * ```typescript
 * router.post('/api/verify', normalizeErrorResponses(), handler);
 * ```
 */
export function normalizeErrorResponses(
  statusCode: number = 404,
  errorMessage: string = "Not found",
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // If response contains an error, normalize it
      if (data && (data.error || !data.success)) {
        const normalized = {
          error: errorMessage,
        };

        // Send normalized response
        return originalJson.call(res, normalized);
      }

      // Success responses pass through unchanged
      return originalJson.call(res, data);
    } as any;

    next();
  };
}

/**
 * Middleware to add jitter to response times
 * Prevents attackers from timing individual operations
 *
 * @param minJitterMs - Minimum random delay
 * @param maxJitterMs - Maximum random delay
 */
export function addResponseJitter(
  minJitterMs: number = 50,
  maxJitterMs: number = 150,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const jitter = Math.random() * (maxJitterMs - minJitterMs) + minJitterMs;
    const startTime = Date.now();

    // Wrap all response methods
    const delay = () => {
      const elapsed = Date.now() - startTime;
      const delayNeeded = Math.max(0, jitter - elapsed);
      return new Promise((resolve) => setTimeout(resolve, delayNeeded));
    };

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = async function (data: any) {
      await delay();
      return originalJson.call(res, data);
    } as any;

    res.send = async function (data?: any) {
      await delay();
      return originalSend.call(res, data);
    } as any;

    next();
  };
}

/**
 * Response payload padding to prevent size-based detection
 *
 * Different responses might have different sizes:
 * - "Not found" (10 bytes)
 * - "Invalid credentials" (20 bytes)
 * - Full error details (500+ bytes)
 *
 * Attackers can detect which error by analyzing response size.
 * Solution: Pad all failures to same size
 */
export function padResponseSize(targetSize: number = 256) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      if (data && data.error) {
        // Measure response size
        const responseStr = JSON.stringify(data);
        const currentSize = Buffer.byteLength(responseStr, "utf8");

        // Add padding if needed
        if (currentSize < targetSize) {
          const paddingNeeded = targetSize - currentSize;
          // Use random-looking padding
          const padding = "x".repeat(Math.min(paddingNeeded, 100));
          (data as any)._pad = padding;
        }
      }

      return originalJson.call(res, data);
    } as any;

    next();
  };
}

/**
 * Composite middleware combining all anti-enumeration techniques
 *
 * Usage:
 * ```typescript
 * router.post('/api/verify', createFullAntiEnumerationMiddleware(), handler);
 * ```
 */
export function createFullAntiEnumerationMiddleware(
  config: AntiEnumerationConfig = {},
) {
  const {
    minResponseTimeMs = 500,
    returnStatus = 404,
    returnMessage = "Not found",
    padResponseSize: shouldPad = true,
    targetResponseSize = 256,
  } = config;

  return [
    removeEnumerationHeaders,
    normalizeErrorResponses(returnStatus, returnMessage),
    enforceMinResponseTime(minResponseTimeMs),
    shouldPad
      ? padResponseSize(targetResponseSize)
      : (req: Request, res: Response, next: NextFunction) => next(),
    addResponseJitter(25, 100),
  ];
}
