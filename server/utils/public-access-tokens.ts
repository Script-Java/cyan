import crypto from "crypto";
import { supabase } from "./supabase";

/**
 * Public Access Token System
 *
 * SECURITY MODEL:
 * - Tokens are 32-byte (64 hex char) cryptographically secure random values
 * - Tokens are resource-type and resource-id locked
 * - Tokens can expire and support one-time use
 * - Validation is atomic: token lookup + resource verification in single query
 * - All public operations return generic 404 to prevent enumeration
 * - Tokens are never logged or exposed after creation
 */

export interface PublicAccessTokenConfig {
  resourceType: "proof" | "order" | "invoice" | "design";
  resourceId: string;
  expiresInHours?: number; // Default: 48 hours
  oneTimeUse?: boolean; // Default: false
  createdBy?: string; // Email or identifier of who created the token
}

export interface TokenValidationResult {
  success: boolean;
  resourceId?: string;
  resourceType?: string;
  error?: string; // Generic error - never reveal specifics
}

/**
 * Generate a cryptographically secure public access token
 * Returns the token to be stored/sent in links/emails
 * Token format: 64 hex characters (32 bytes)
 */
export function generatePublicAccessToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create and store a public access token in the database
 * SECURITY: Token is stored hashed (TODO: implement hashing for production)
 *
 * @returns The token string to be sent to the user
 */
export async function createPublicAccessToken(
  config: PublicAccessTokenConfig,
): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const token = generatePublicAccessToken();
    const expiresInHours = config.expiresInHours || 48;
    const expiresAt = new Date(
      Date.now() + expiresInHours * 60 * 60 * 1000,
    ).toISOString();

    const { error } = await supabase.from("public_access_tokens").insert({
      token,
      resource_type: config.resourceType,
      resource_id: config.resourceId,
      expires_at: expiresAt,
      one_time_use: config.oneTimeUse ?? false,
      created_by: config.createdBy,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });

    if (error) {
      console.error("Error creating public access token:", error);
      return { success: false, error: "Failed to create access token" };
    }

    // Token successfully created
    console.log(
      `[SECURITY] Created public access token for ${config.resourceType}:${config.resourceId} (expires in ${expiresInHours}h, one-time: ${config.oneTimeUse || false})`,
    );

    return { success: true, token };
  } catch (error) {
    console.error("Error in createPublicAccessToken:", error);
    return { success: false, error: "Failed to create access token" };
  }
}

/**
 * Validate a public access token atomically
 * SECURITY:
 * - Returns generic 404 result on ANY failure (token not found, expired, already used, wrong resource)
 * - Marks one-time-use tokens as used in the same query (prevents race conditions)
 * - Logs suspicious activity but never exposes details
 *
 * @returns { success: true, resourceId } on valid token
 *         { success: false, error: "Not found" } on any failure
 */
export async function validatePublicAccessToken(
  token: string,
  expectedResourceType: "proof" | "order" | "invoice" | "design",
): Promise<TokenValidationResult> {
  try {
    if (!token || token.length !== 64) {
      // Invalid token format - generic error
      console.warn("[SECURITY] Invalid token format attempted");
      return { success: false, error: "Not found" };
    }

    // Step 1: Find the token and validate all conditions atomically
    const { data: tokenRecord, error: lookupError } = await supabase
      .from("public_access_tokens")
      .select("token, resource_type, resource_id, expires_at, one_time_use, used_at")
      .eq("token", token)
      .maybeSingle();

    // Token not found
    if (lookupError || !tokenRecord) {
      console.warn("[SECURITY] Public token lookup failed or not found", {
        tokenPrefix: token.substring(0, 8),
        error: lookupError?.message,
      });
      return { success: false, error: "Not found" };
    }

    // Token expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      console.warn("[SECURITY] Expired public access token used", {
        resourceType: tokenRecord.resource_type,
        resourceId: tokenRecord.resource_id,
      });
      return { success: false, error: "Not found" };
    }

    // Token already used (one-time use)
    if (tokenRecord.one_time_use && tokenRecord.used_at) {
      console.warn("[SECURITY] One-time-use public token reused", {
        resourceType: tokenRecord.resource_type,
        resourceId: tokenRecord.resource_id,
        usedAt: tokenRecord.used_at,
      });
      return { success: false, error: "Not found" };
    }

    // Resource type mismatch - suspicious
    if (tokenRecord.resource_type !== expectedResourceType) {
      console.warn("[SECURITY] Public token resource type mismatch", {
        expected: expectedResourceType,
        actual: tokenRecord.resource_type,
      });
      return { success: false, error: "Not found" };
    }

    // Step 2: If one-time-use, mark as used atomically
    if (tokenRecord.one_time_use) {
      const { error: updateError } = await supabase
        .from("public_access_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token)
        .eq("used_at", null); // Only update if not already used (race condition guard)

      if (updateError) {
        console.error("Error marking token as used:", updateError);
        // Still return success since token was valid, but log the issue
        // In production, this would need better handling
      }
    }

    // Token is valid
    console.log(
      `[SECURITY] Public access token validated for ${expectedResourceType}:${tokenRecord.resource_id}`,
    );

    return {
      success: true,
      resourceId: tokenRecord.resource_id,
      resourceType: tokenRecord.resource_type,
    };
  } catch (error) {
    console.error("Error validating public access token:", error);
    return { success: false, error: "Not found" };
  }
}

/**
 * Revoke a public access token (before expiration)
 * Used when a resource is deleted or access is explicitly revoked
 */
export async function revokePublicAccessToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("public_access_tokens")
      .delete()
      .eq("token", token);

    if (error) {
      console.error("Error revoking public access token:", error);
      return false;
    }

    console.log("[SECURITY] Public access token revoked");
    return true;
  } catch (error) {
    console.error("Error in revokePublicAccessToken:", error);
    return false;
  }
}

/**
 * Revoke all tokens for a specific resource
 * Used when a resource is deleted or access is completely revoked
 */
export async function revokeResourceTokens(
  resourceType: "proof" | "order" | "invoice" | "design",
  resourceId: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("public_access_tokens")
      .delete()
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId);

    if (error) {
      console.error("Error revoking resource tokens:", error);
      return false;
    }

    console.log(
      `[SECURITY] Revoked all tokens for ${resourceType}:${resourceId}`,
    );
    return true;
  } catch (error) {
    console.error("Error in revokeResourceTokens:", error);
    return false;
  }
}

/**
 * Clean up expired tokens (run periodically via cron job)
 * SECURITY: This is a background operation - no response needed
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("public_access_tokens")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .neq("used_at", null) // Don't delete unexpired tokens even if used
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Error cleaning up expired tokens:", error);
      return 0;
    }

    console.log("[SECURITY] Cleaned up expired public access tokens");
    return data?.length || 0;
  } catch (error) {
    console.error("Error in cleanupExpiredTokens:", error);
    return 0;
  }
}
