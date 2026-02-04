import crypto from "crypto";

/**
 * Identifier Hashing and Normalization Utilities
 *
 * PURPOSE:
 * - Track abuse attempts without storing PII
 * - Normalize identifiers to prevent bypass via format manipulation
 * - Hash identifiers for rate limiting keys
 * - Prevent timing side-channels based on identifier format
 *
 * SECURITY:
 * - Uses SHA-256 for hashing (uniform distribution)
 * - Salted with endpoint-specific constants
 * - Identifiers normalized before hashing (prevents bypass)
 * - No identifiers logged in plaintext
 */

/**
 * Normalize order number to canonical form
 * Handles: "12345", "12,345", "0x3039" (hex), leading zeros, etc.
 *
 * @param orderNumber - Order number in any format
 * @returns Normalized order number (digits only)
 */
export function normalizeOrderNumber(orderNumber: string | number): string {
  if (typeof orderNumber === "number") {
    return orderNumber.toString();
  }

  // Remove all non-digit characters
  const digits = orderNumber.replace(/\D/g, "");

  // Remove leading zeros (prevent "0001234" vs "1234" bypass)
  const normalized = digits.replace(/^0+/, "") || "0";

  return normalized;
}

/**
 * Normalize email to canonical form
 * Handles: case sensitivity, whitespace, etc.
 *
 * @param email - Email address
 * @returns Normalized email (lowercase, trimmed)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize phone number to canonical form
 * Handles: formatting variations, country codes, etc.
 *
 * @param phone - Phone number in any format
 * @returns Normalized phone (digits only, no formatting)
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading '+'
  let normalized = phone.replace(/[^\d+]/g, "");

  // Remove leading '+' for comparison (but track it existed)
  if (normalized.startsWith("+")) {
    normalized = normalized.substring(1);
  }

  return normalized;
}

/**
 * Normalize invoice number
 * Similar to order number normalization
 *
 * @param invoiceNumber - Invoice number
 * @returns Normalized invoice number
 */
export function normalizeInvoiceNumber(invoiceNumber: string | number): string {
  return normalizeOrderNumber(invoiceNumber);
}

/**
 * Hash identifier for use as rate limit key
 * Produces consistent hash for same normalized identifier
 *
 * SECURITY:
 * - Uses SHA-256 (uniform distribution)
 * - Salted with endpoint + identifier type
 * - Always produces same hash for same identifier (after normalization)
 * - Hash length: 64 hex characters
 *
 * @param identifier - The identifier to hash
 * @param type - Type of identifier (order, email, phone, invoice, etc.)
 * @param endpoint - API endpoint being accessed (for salt)
 * @returns 64-character hex hash
 */
export function hashIdentifier(
  identifier: string,
  type: "order" | "email" | "phone" | "invoice" | "design",
  endpoint: string,
): string {
  // Create salt from endpoint + type (prevents cross-endpoint hash matching)
  const salt = `${endpoint}:${type}`;

  // Hash with salt
  const hash = crypto
    .createHmac("sha256", salt)
    .update(identifier)
    .digest("hex");

  return hash;
}

/**
 * Hash an IP address for privacy
 * Uses consistent salted hash so same IP produces same hash
 * Allows grouping of attempts without storing raw IP
 *
 * @param ip - IP address
 * @returns 64-character hex hash
 */
export function hashIPAddress(ip: string): string {
  // Salt: current month (resets monthly, prevents long-term IP tracking)
  const month = new Date().toISOString().substring(0, 7); // YYYY-MM
  const salt = `ip-hash:${month}`;

  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}

/**
 * Get first N characters of hash for logging
 * Useful for brevity while maintaining uniqueness
 *
 * @param hash - Full hash
 * @param length - Number of chars to return (default: 8)
 * @returns Prefix of hash
 */
export function hashPrefix(hash: string, length: number = 8): string {
  return hash.substring(0, Math.min(length, hash.length));
}

/**
 * Create a rate limit key from multiple components
 * Ensures proper grouping for rate limiting
 *
 * @param baseKey - Primary identifier (e.g., hashed IP)
 * @param identifierHash - Optional identifier being accessed
 * @param endpoint - API endpoint
 * @returns Rate limit key string
 */
export function createRateLimitKey(
  baseKey: string, // IP hash or similar
  identifierHash?: string,
  endpoint?: string,
): string {
  const parts = [baseKey];

  if (identifierHash) {
    parts.push(identifierHash);
  }

  if (endpoint) {
    parts.push(endpoint);
  }

  return parts.join(":");
}

/**
 * Verify that an identifier matches its hash (for testing/validation)
 * Useful for audit purposes
 *
 * @param identifier - Original identifier
 * @param hash - Hash to verify
 * @param type - Identifier type
 * @param endpoint - Endpoint
 * @returns true if hash matches identifier
 */
export function verifyIdentifierHash(
  identifier: string,
  hash: string,
  type: "order" | "email" | "phone" | "invoice" | "design",
  endpoint: string,
): boolean {
  const expectedHash = hashIdentifier(identifier, type, endpoint);
  return expectedHash === hash;
}

/**
 * Format identifier for logging (without exposing full value)
 * Shows type and prefix only
 *
 * @param identifier - The identifier
 * @param type - Type of identifier
 * @returns Formatted string for logging (e.g., "order:1234...")
 */
export function formatIdentifierForLogging(
  identifier: string,
  type: "order" | "email" | "phone" | "invoice" | "design",
): string {
  // Show type and first 4-8 characters (not sensitive for hashed values)
  const prefix = identifier.substring(0, 8);
  return `${type}:${prefix}...`;
}

/**
 * Extract subdomain from email (for pattern analysis without revealing email)
 * Useful for credential stuffing detection
 *
 * @param email - Email address
 * @returns Domain part (e.g., "gmail.com" from "user@gmail.com")
 */
export function extractEmailDomain(email: string): string {
  const normalized = normalizeEmail(email);
  const parts = normalized.split("@");
  return parts.length === 2 ? parts[1] : "";
}

/**
 * Extract country code from phone number
 * Useful for pattern analysis (detecting distributed attacks)
 *
 * @param phone - Phone number
 * @returns Country code if detectable, empty string otherwise
 */
export function extractPhoneCountryCode(phone: string): string {
  const normalized = normalizePhone(phone);

  // US: 1 + 10 digits, Canada: also 1 + 10 digits
  if (normalized.length === 11 && normalized.startsWith("1")) {
    return "1";
  }

  // Other patterns could be added
  // For now, just detect 1-digit country codes
  if (normalized.length <= 3) {
    return normalized;
  }

  return "";
}

/**
 * Check if two identifiers (after normalization) are similar
 * Useful for detecting variations of same attack
 *
 * @param id1 - First identifier
 * @param id2 - Second identifier
 * @param type - Type of identifier
 * @param threshold - Similarity threshold (0-1, default 0.8)
 * @returns true if similar
 */
export function areSimilarIdentifiers(
  id1: string,
  id2: string,
  type: "order" | "email" | "phone" | "invoice",
  threshold: number = 0.8,
): boolean {
  let norm1, norm2;

  switch (type) {
    case "order":
    case "invoice":
      norm1 = normalizeOrderNumber(id1);
      norm2 = normalizeOrderNumber(id2);
      // For numeric, check if within reasonable range (±10)
      const num1 = parseInt(norm1, 10);
      const num2 = parseInt(norm2, 10);
      return Math.abs(num1 - num2) <= 10;

    case "email":
      norm1 = normalizeEmail(id1);
      norm2 = normalizeEmail(id2);
      // Check if same domain (for credential stuffing detection)
      const domain1 = extractEmailDomain(norm1);
      const domain2 = extractEmailDomain(norm2);
      return domain1 === domain2 && domain1.length > 0;

    case "phone":
      norm1 = normalizePhone(id1);
      norm2 = normalizePhone(id2);
      // Check if same country code and within reasonable range
      const country1 = extractPhoneCountryCode(norm1);
      const country2 = extractPhoneCountryCode(norm2);
      return country1 === country2 && country1.length > 0;

    default:
      return false;
  }
}

/**
 * Generate a challenge string for rate-limited users
 * Used for CAPTCHA or other verification
 *
 * @param identifier - Identifier being challenged
 * @returns Challenge string (non-sensitive)
 */
export function generateChallenge(identifier: string): string {
  // Use hash to create deterministic but non-revealing challenge
  const hash = crypto.createHash("sha256").update(identifier).digest("hex");
  return hash.substring(0, 16);
}

/**
 * Check if an identifier looks like it's part of enumeration
 * Examples: "1", "2", "3" or "1000", "1001", "1002"
 *
 * @param current - Current identifier
 * @param previous - Previous attempt identifier
 * @param type - Type of identifier
 * @returns true if looks like sequential enumeration
 */
export function looksLikeEnumeration(
  current: string,
  previous: string,
  type: "order" | "phone" | "invoice",
): boolean {
  if (type === "order" || type === "invoice") {
    const normCurrent = parseInt(normalizeOrderNumber(current), 10);
    const normPrevious = parseInt(normalizeOrderNumber(previous), 10);

    // Check if sequential (exactly ±1 or ±10)
    const diff = Math.abs(normCurrent - normPrevious);
    return diff === 1 || diff === 10 || diff === 100;
  }

  if (type === "phone") {
    const normCurrent = normalizePhone(current);
    const normPrevious = normalizePhone(previous);

    // Check if last digit incremented
    if (normCurrent.length === normPrevious.length) {
      const diffAtEnd =
        parseInt(normCurrent[normCurrent.length - 1]) -
        parseInt(normPrevious[normPrevious.length - 1]);
      return Math.abs(diffAtEnd) === 1;
    }
  }

  return false;
}
