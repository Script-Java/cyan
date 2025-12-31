import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

// Enforce JWT_SECRET - fail immediately if not set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "CRITICAL: JWT_SECRET environment variable is not set. This is required for secure token verification in production."
    );
    process.exit(1);
  } else {
    console.warn(
      "WARNING: JWT_SECRET not set. Using temporary secret for development only."
    );
  }
}

declare global {
  namespace Express {
    interface Request {
      customerId?: number;
      email?: string;
      isAdmin?: boolean;
    }
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || "",
);

/**
 * Middleware to verify JWT token and extract customer info
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!JWT_SECRET) {
      res.status(500).json({ error: "Server configuration error" });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No authorization token provided" });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as {
      customerId: number;
      email: string;
    };

    req.customerId = decoded.customerId;
    req.email = decoded.email;

    // Fetch customer to get isAdmin status
    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("is_admin")
        .eq("id", decoded.customerId)
        .single();

      req.isAdmin = customer?.is_admin || false;
    } catch (error) {
      // If we can't fetch from DB, default to false
      req.isAdmin = false;
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware to optionally verify token (doesn't fail if missing)
 */
export const optionalVerifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as {
        customerId: number;
        email: string;
      };

      req.customerId = decoded.customerId;
      req.email = decoded.email;

      // Fetch customer to get isAdmin status
      try {
        const { data: customer } = await supabase
          .from("customers")
          .select("is_admin")
          .eq("id", decoded.customerId)
          .single();

        req.isAdmin = customer?.is_admin || false;
      } catch (error) {
        // If we can't fetch from DB, default to false
        req.isAdmin = false;
      }
    }

    next();
  } catch (error) {
    // Token verification failed, but we continue
    // This is useful for endpoints that work with or without auth
    next();
  }
};

/**
 * Middleware to require admin role
 * Must be used after verifyToken middleware
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.customerId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!req.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
};
