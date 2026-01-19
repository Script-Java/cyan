/**
 * Order utilities for consistent order number formatting across the app
 */

/**
 * Format an order ID to the display format: SY-5XXXXX
 * Formula: SY-5 + (4001 + orderId)
 * Example: orderId 10 → SY-54011
 */
export function formatOrderNumber(orderId: number | string): string {
  const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;
  if (isNaN(id) || id <= 0) {
    throw new Error("Invalid order ID");
  }
  const displayNumber = 4001 + id;
  return `SY-5${displayNumber}`;
}

/**
 * Parse a formatted order number (SY-XXXXX) back to the numeric ID
 * Handles both SY-XXXXX format and plain numeric format for backward compatibility
 * Example: "SY-54011" → 10 or "10" → 10
 */
export function parseOrderNumber(orderNumber: string): number {
  const trimmed = orderNumber.trim();

  if (trimmed.toUpperCase().startsWith("SY-5")) {
    // Format: SY-54011 where 4011 = 4001 + id, so id = 4011 - 4001
    const displayNumber = parseInt(trimmed.substring(4), 10);
    if (isNaN(displayNumber)) {
      throw new Error("Invalid order number format");
    }
    const id = displayNumber - 4001;
    if (id <= 0) {
      throw new Error("Invalid order number format");
    }
    return id;
  } else {
    // Plain numeric format
    const id = parseInt(trimmed, 10);
    if (isNaN(id)) {
      throw new Error("Invalid order number format");
    }
    return id;
  }
}
