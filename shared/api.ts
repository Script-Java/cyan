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
