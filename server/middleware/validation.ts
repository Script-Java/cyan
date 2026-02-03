import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

/**
 * Validation error response format
 */
interface ValidationError {
  field: string;
  message: string;
}

interface ValidationErrorResponse {
  error: string;
  details: ValidationError[];
}

/**
 * Parse Zod validation errors into a user-friendly format
 */
export function parseValidationErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join(".") || "unknown",
    message: err.message,
  }));
}

/**
 * Validate request body against a Zod schema
 *
 * Usage:
 * ```typescript
 * app.post('/api/endpoint',
 *   validateBody(MySchema),
 *   handleMyRoute
 * );
 *
 * // In handler:
 * const data = req.body; // TypeScript-safe, already validated
 * ```
 */
export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = parseValidationErrors(error);
        return res.status(400).json({
          error: "Request validation failed",
          details,
        } as ValidationErrorResponse);
      }

      // Unexpected error
      console.error("Validation middleware error:", error);
      return res.status(500).json({
        error: "Internal validation error",
      });
    }
  };
}

/**
 * Validate request parameters against a Zod schema
 *
 * Usage:
 * ```typescript
 * app.get('/api/endpoint/:id',
 *   validateParams(z.object({ id: z.string().uuid() })),
 *   handleMyRoute
 * );
 *
 * // In handler:
 * const { id } = req.params; // TypeScript-safe, already validated
 * ```
 */
export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = parseValidationErrors(error);
        return res.status(400).json({
          error: "Invalid route parameters",
          details,
        } as ValidationErrorResponse);
      }

      console.error("Validation middleware error:", error);
      return res.status(500).json({
        error: "Internal validation error",
      });
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 *
 * Usage:
 * ```typescript
 * app.get('/api/list',
 *   validateQuery(z.object({
 *     page: z.coerce.number().optional(),
 *     limit: z.coerce.number().optional(),
 *   })),
 *   handleMyRoute
 * );
 *
 * // In handler:
 * const { page, limit } = req.query; // TypeScript-safe, already validated
 * ```
 */
export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = parseValidationErrors(error);
        return res.status(400).json({
          error: "Invalid query parameters",
          details,
        } as ValidationErrorResponse);
      }

      console.error("Validation middleware error:", error);
      return res.status(500).json({
        error: "Internal validation error",
      });
    }
  };
}

/**
 * NOTE: validate() function is defined in server/schemas/validation.ts
 * Import from there instead: import { validate } from "../schemas/validation";
 */

/**
 * Type-safe response builder
 * Ensures consistent error response format
 *
 * Usage:
 * ```typescript
 * if (validationResult.error) {
 *   return res.status(400).json(validationResult.error);
 * }
 * ```
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
): ValidationErrorResponse {
  return {
    error: "Request validation failed",
    details: errors,
  };
}
