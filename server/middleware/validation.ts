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
export function parseValidationErrors(
  error: z.ZodError,
): ValidationError[] {
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
 * Utility to validate data within a route handler
 * Useful for complex validation or conditional validation
 * 
 * Usage:
 * ```typescript
 * const validated = await validate(MySchema, req.body);
 * if (!validated.success) {
 *   return res.status(400).json({
 *     error: "Validation failed",
 *     details: validated.errors,
 *   });
 * }
 * const data = validated.data;
 * ```
 */
export async function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Promise<
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }
> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: parseValidationErrors(error),
      };
    }

    // Unexpected error
    console.error("Validation error:", error);
    return {
      success: false,
      errors: [
        {
          field: "unknown",
          message: "An unexpected validation error occurred",
        },
      ],
    };
  }
}

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
