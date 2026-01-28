/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Support submission request
 */
export interface SupportSubmissionRequest {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
}

/**
 * Support submission response
 */
export interface SupportSubmissionResponse {
  success: boolean;
  message: string;
  referenceId?: string;
}

/**
 * Discount code
 */
export interface DiscountCode {
  id: number;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

/**
 * Discount code validation request
 */
export interface ValidateDiscountCodeRequest {
  code: string;
  orderTotal: number;
}

/**
 * Discount code validation response
 */
export interface ValidateDiscountCodeResponse {
  success: boolean;
  error?: string;
  discount?: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    amount: number;
    description?: string;
  };
}
