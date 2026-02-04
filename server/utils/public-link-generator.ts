import {
  createPublicAccessToken,
  PublicAccessTokenConfig,
} from "./public-access-tokens";

/**
 * Generate secure public links for email communications
 * SECURITY: Links include cryptographically secure tokens instead of guessable IDs
 */

export interface ProofReviewLinks {
  approveLink: string;
  reviseLink: string;
  approvalToken: string;
  revisionToken: string;
}

/**
 * Generate secure email links for proof review
 * Creates one-time-use tokens that expire in 72 hours
 *
 * @param proofId - The proof ID to generate links for
 * @param baseUrl - Frontend base URL (e.g., https://stickyslap.app)
 * @returns Links and tokens for email generation
 */
export async function generateProofReviewLinks(
  proofId: string,
  baseUrl: string = process.env.FRONTEND_URL || "https://stickyslap.app",
): Promise<ProofReviewLinks | null> {
  try {
    // Generate two separate one-time-use tokens
    // (prevents single token from being used for multiple actions)
    const approvalTokenResult = await createPublicAccessToken({
      resourceType: "proof",
      resourceId: proofId,
      expiresInHours: 72,
      oneTimeUse: true,
      createdBy: "email-link-generator",
    });

    const revisionTokenResult = await createPublicAccessToken({
      resourceType: "proof",
      resourceId: proofId,
      expiresInHours: 72,
      oneTimeUse: true,
      createdBy: "email-link-generator",
    });

    if (!approvalTokenResult.success || !revisionTokenResult.success) {
      console.error("Failed to generate proof review tokens");
      return null;
    }

    return {
      approveLink: `${baseUrl}/proofs/review?token=${approvalTokenResult.token}&action=approve`,
      reviseLink: `${baseUrl}/proofs/review?token=${revisionTokenResult.token}&action=revise`,
      approvalToken: approvalTokenResult.token!,
      revisionToken: revisionTokenResult.token!,
    };
  } catch (error) {
    console.error("Error generating proof review links:", error);
    return null;
  }
}

export interface OrderStatusLink {
  statusLink: string;
  token: string;
}

/**
 * Generate secure email link for order status tracking
 * Creates a reusable token (not one-time-use) that expires in 7 days
 * (customers may need to view order status multiple times)
 *
 * @param orderId - The order ID to generate link for
 * @param baseUrl - Frontend base URL
 * @returns Link and token for email generation
 */
export async function generateOrderStatusLink(
  orderId: string,
  baseUrl: string = process.env.FRONTEND_URL || "https://stickyslap.app",
): Promise<OrderStatusLink | null> {
  try {
    const tokenResult = await createPublicAccessToken({
      resourceType: "order",
      resourceId: orderId,
      expiresInHours: 7 * 24, // 7 days - longer than proof (customers check multiple times)
      oneTimeUse: false, // Reusable - customers may check status multiple times
      createdBy: "email-link-generator",
    });

    if (!tokenResult.success) {
      console.error("Failed to generate order status token");
      return null;
    }

    return {
      statusLink: `${baseUrl}/orders/track?token=${tokenResult.token}`,
      token: tokenResult.token!,
    };
  } catch (error) {
    console.error("Error generating order status link:", error);
    return null;
  }
}

export interface InvoicePaymentLink {
  paymentLink: string;
  token: string;
}

/**
 * Generate secure email link for invoice payment
 * Creates a reusable token (not one-time-use) that expires in 30 days
 * (customers may need multiple attempts to pay)
 *
 * @param invoiceId - The invoice ID to generate link for
 * @param baseUrl - Frontend base URL
 * @returns Link and token for email generation
 */
export async function generateInvoicePaymentLink(
  invoiceId: string,
  baseUrl: string = process.env.FRONTEND_URL || "https://stickyslap.app",
): Promise<InvoicePaymentLink | null> {
  try {
    const tokenResult = await createPublicAccessToken({
      resourceType: "invoice",
      resourceId: invoiceId,
      expiresInHours: 30 * 24, // 30 days - customers may attempt multiple times
      oneTimeUse: false, // Reusable - payment may require multiple attempts
      createdBy: "email-link-generator",
    });

    if (!tokenResult.success) {
      console.error("Failed to generate invoice payment token");
      return null;
    }

    return {
      paymentLink: `${baseUrl}/invoices/pay?token=${tokenResult.token}`,
      token: tokenResult.token!,
    };
  } catch (error) {
    console.error("Error generating invoice payment link:", error);
    return null;
  }
}

/**
 * Generate secure link for design file access
 * Creates a token that expires in 30 days (design uploads may need extended access)
 *
 * @param designId - The design ID to generate link for
 * @param baseUrl - Frontend base URL
 * @returns Link and token for email generation
 */
export async function generateDesignAccessLink(
  designId: string,
  baseUrl: string = process.env.FRONTEND_URL || "https://stickyslap.app",
): Promise<{ link: string; token: string } | null> {
  try {
    const tokenResult = await createPublicAccessToken({
      resourceType: "design",
      resourceId: designId,
      expiresInHours: 30 * 24, // 30 days
      oneTimeUse: false,
      createdBy: "email-link-generator",
    });

    if (!tokenResult.success) {
      console.error("Failed to generate design access token");
      return null;
    }

    return {
      link: `${baseUrl}/designs/view?token=${tokenResult.token}`,
      token: tokenResult.token!,
    };
  } catch (error) {
    console.error("Error generating design access link:", error);
    return null;
  }
}

/**
 * Utility function to embed token in a base URL
 * Useful for simple cases where you just want to add token to existing URL
 *
 * @param baseUrl - The base URL
 * @param token - The token to embed
 * @param paramName - Query parameter name (default: 'token')
 * @returns Full URL with token
 */
export function embedTokenInUrl(
  baseUrl: string,
  token: string,
  paramName: string = "token",
): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${paramName}=${token}`;
}
