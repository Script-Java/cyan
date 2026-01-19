/**
 * Format an order ID to the display format: SY-XXXXX
 * Formula: SY-5 + (4001 + orderId)
 * Example: orderId 10 → SY-54011
 */
export function formatOrderNumber(orderId: number | string): string {
  const id = typeof orderId === "string" ? parseInt(orderId, 10) : orderId;
  if (isNaN(id) || id <= 0) {
    console.warn("Invalid order ID for formatting:", orderId);
    return `#${orderId}`;
  }
  const displayNumber = 4001 + id;
  return `SY-5${displayNumber}`;
}
