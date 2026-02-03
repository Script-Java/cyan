# Unified Request Validation with Zod

## Overview

This document describes the centralized request validation system using Zod to ensure consistent, declarative validation across all API endpoints.

## Architecture

### 1. Schema Definition Layer (`server/schemas/validation.ts`)

All request/response schemas are defined once and reused across routes:

```typescript
// Centralized schema definitions
export const UpdateCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: PhoneSchema,
  email: EmailSchema.optional(),
});

// Export TypeScript types for type safety
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
```

**Benefits:**

- ✅ Single source of truth for validation rules
- ✅ Type-safe: TypeScript infers types from schemas
- ✅ Reusable: Schemas can be composed from other schemas
- ✅ Maintainable: Update rules in one place

### 2. Validation Utilities (`server/middleware/validation.ts` & `server/schemas/validation.ts`)

Three validation approaches for different use cases:

#### A. Middleware-based Validation (Route registration)

```typescript
import { validateBody } from "../middleware/validation";
import { CreateProductSchema } from "../schemas/validation";

// Validates ALL requests before handler is called
app.post(
  "/api/products",
  validateBody(CreateProductSchema),
  handleCreateProduct, // req.body is now guaranteed to be valid
);
```

**Usage:** Request fails at middleware level before handler executes

#### B. Handler-level Validation (Conditional/complex cases)

```typescript
import { validate } from "../schemas/validation";

export const handleCheckout: RequestHandler = async (req, res) => {
  const validationResult = await validate(CheckoutSchema, req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: "Request validation failed",
      details: validationResult.errors,
    });
  }

  const data = validationResult.data; // TypeScript knows type here
  // ... rest of handler
};
```

**Usage:** Validation happens inside handler for complex decisions

#### C. Parameter Validation (Route params)

```typescript
const orderIdNum = parseInt(productId, 10);
if (isNaN(orderIdNum) || orderIdNum <= 0) {
  return res.status(400).json({
    error: "Request validation failed",
    details: [
      { field: "productId", message: "Product ID must be a positive integer" },
    ],
  });
}
```

**Usage:** Simple parameter type coercion with explicit validation

## Error Response Format

All validation errors follow a consistent format:

### Validation Failed

```json
{
  "error": "Request validation failed",
  "details": [
    { "field": "firstName", "message": "First name is required" },
    { "field": "phone", "message": "Invalid phone number format" }
  ]
}
```

### Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### Server Error

```json
{
  "error": "Failed to create product",
  "details": "Database connection timeout"
}
```

## Validation Coverage

### Core Entities (Reusable Schemas)

- **Address:** `street_1`, `street_2`, `city`, `state_or_province`, `postal_code`, `country_iso2`
- **Email:** Valid email format, converted to lowercase
- **Phone:** Optional, regex validation for international formats

### Customer Routes

| Route                       | Schema                        | Validations                                       |
| --------------------------- | ----------------------------- | ------------------------------------------------- |
| `PUT /api/customer`         | `UpdateCustomerSchema`        | Optional name, optional email, optional phone     |
| `POST /api/addresses`       | `CreateCustomerAddressSchema` | All address fields required, country code 2 chars |
| `PUT /api/addresses/:id`    | `UpdateCustomerAddressSchema` | Same as create                                    |
| `DELETE /api/addresses/:id` | (ID param)                    | ID must be positive integer                       |

### Order Routes

| Route                     | Schema                    | Validations                                           |
| ------------------------- | ------------------------- | ----------------------------------------------------- |
| `POST /api/checkout`      | `CheckoutSchema`          | All address fields, ≥1 product, valid customer_id     |
| `POST /api/orders/verify` | `VerifyOrderAccessSchema` | Order number digits only, verification field required |
| `GET /api/orders/:id`     | (ID param)                | ID must be positive integer                           |

### Design Routes

| Route                       | Schema                      | Validations                                  |
| --------------------------- | --------------------------- | -------------------------------------------- |
| `POST /api/designs/upload`  | `UploadDesignRequestSchema` | Base64 file data, file name, ≤50MB file size |
| `GET /api/designs/:orderId` | (ID param)                  | Order ID must be positive integer            |

### Product Routes (Admin)

| Route                            | Schema                | Validations                                                      |
| -------------------------------- | --------------------- | ---------------------------------------------------------------- |
| `POST /api/admin/products`       | `CreateProductSchema` | Product name required, base_price ≥ 0, complex nested validation |
| `PUT /api/admin/products/:id`    | `UpdateProductSchema` | Same as create (all fields optional for PATCH)                   |
| `GET /api/admin/products/:id`    | (ID param)            | Product ID must be positive integer                              |
| `DELETE /api/admin/products/:id` | (ID param)            | Product ID must be positive integer                              |

### Invoice Routes

| Route                   | Schema                | Validations                                     |
| ----------------------- | --------------------- | ----------------------------------------------- |
| `POST /api/invoices`    | `CreateInvoiceSchema` | Customer name/email required, due_date required |
| `PUT /api/invoices/:id` | `UpdateInvoiceSchema` | Same as create (all optional)                   |

## Implementation Guide

### Adding New Validation

#### Step 1: Define Schema (server/schemas/validation.ts)

```typescript
export const MyNewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: EmailSchema,
  age: z.number().int().min(18, "Must be 18+").optional(),
});

export type MyNewInput = z.infer<typeof MyNewSchema>;
```

#### Step 2: Use in Route Handler

**Option A: Middleware (Recommended for simple routes)**

```typescript
import { validateBody } from "../middleware/validation";
import { MyNewSchema } from "../schemas/validation";

app.post("/api/new-endpoint", validateBody(MyNewSchema), handleNewEndpoint);

export const handleNewEndpoint: RequestHandler = async (req, res) => {
  // req.body is already validated and typed
  const { name, email, age } = req.body;
  // ... handler logic
};
```

**Option B: Handler-level (For conditional validation)**

```typescript
import { validate } from "../schemas/validation";
import { MyNewSchema } from "../schemas/validation";

export const handleNewEndpoint: RequestHandler = async (req, res) => {
  const result = await validate(MyNewSchema, req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Request validation failed",
      details: result.errors,
    });
  }

  const { name, email, age } = result.data;
  // ... handler logic
};
```

## Schema Composition

Schemas can be built from other schemas:

```typescript
// Base address schema
export const AddressSchema = z.object({
  street_1: z.string().min(1),
  city: z.string().min(1),
  // ...
});

// Reuse in checkout
export const CheckoutSchema = z.object({
  billing_address: AddressSchema,
  shipping_addresses: z.array(AddressSchema),
  // ... other fields
});
```

## Type Safety

Get TypeScript types automatically from schemas:

```typescript
// Define schema
export const CreateProductSchema = z.object({ /* ... */ });

// Get type
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// Use in handler with type safety
export const handleCreateProduct: RequestHandler = async (req, res) => {
  const validationResult = await validate(CreateProductSchema, req.body);
  if (!validationResult.success) return res.status(400).json({...});

  // TypeScript knows the type here
  const data: CreateProductInput = validationResult.data;
  // ✅ Autocomplete works
  // ✅ Type errors caught at compile time
};
```

## Common Validation Patterns

### Optional vs Required

```typescript
// Required
z.string().min(1, "Field is required");

// Optional (client can omit)
z.string().optional();

// Optional but if provided, must meet criteria
z.string().min(1, "If provided, must be at least 1 char").optional();
```

### Numeric Ranges

```typescript
// Positive integer
z.number().int().min(1);

// Percentage (0-100)
z.number().min(0).max(100);

// Non-negative decimal
z.number().min(0);
```

### Array Validation

```typescript
// At least one item
z.array(ItemSchema).min(1, "At least one item required");

// Optional array (defaults to empty)
z.array(ItemSchema).optional().default([]);
```

### Custom Validation Rules

```typescript
// Phone must be digits only (with optional +)
PhoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-\(\)]+$/, "Invalid phone format")
  .optional();

// Email lowercase transform
EmailSchema = z.string().email().toLowerCase();
```

## Testing Validation

### Unit Test Example

```typescript
import { CreateProductSchema } from "../schemas/validation";

describe("Product Validation", () => {
  it("rejects negative price without variants", () => {
    const invalid = {
      name: "Product",
      basePrice: -10,
      sharedVariants: [],
    };
    expect(() => CreateProductSchema.parse(invalid)).toThrow();
  });

  it("accepts valid product", () => {
    const valid = {
      name: "Product",
      basePrice: 9.99,
      description: "A product",
    };
    const result = CreateProductSchema.parse(valid);
    expect(result.basePrice).toBe(9.99);
  });
});
```

### API Test Example

```typescript
// Invalid request
const response = await fetch("/api/products", {
  method: "POST",
  body: JSON.stringify({ name: "" }), // Missing required fields
});

// Should return 400 with validation details
expect(response.status).toBe(400);
const json = await response.json();
expect(json.error).toBe("Request validation failed");
expect(json.details).toContainEqual({
  field: "name",
  message: "Product name is required",
});
```

## Migration from Manual Validation

### Before: Manual Checks

```typescript
export const handleUpdateCustomer = async (req, res) => {
  const { firstName, lastName, phone, email } = req.body;

  // ❌ Many manual checks
  if (!firstName || !lastName) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (email && !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (phone && !/^\+?[0-9\s\-]+$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone" });
  }

  // Handler logic
};
```

### After: Zod Validation

```typescript
export const handleUpdateCustomer: RequestHandler = async (req, res) => {
  // ✅ One validation call
  const result = await validate(UpdateCustomerSchema, req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Request validation failed",
      details: result.errors,
    });
  }

  const { firstName, lastName, phone, email } = result.data;

  // Handler logic
};
```

## Benefits Summary

| Aspect               | Manual Validation     | Zod Validation               |
| -------------------- | --------------------- | ---------------------------- |
| **Code Duplication** | High (rules repeated) | Low (DRY)                    |
| **Type Safety**      | Manual types          | Automatic inference          |
| **Error Messages**   | Inconsistent          | Consistent                   |
| **Maintainability**  | Hard (scattered)      | Easy (centralized)           |
| **Testing**          | Hard (many branches)  | Easy (test schemas)          |
| **Documentation**    | Separate docs         | Schemas are self-documenting |
| **Composability**    | Limited               | Full (nested schemas)        |

## Compliance & Standards

- ✅ **OWASP Input Validation:** Validates all untrusted input
- ✅ **Type Safety:** Full TypeScript support
- ✅ **Error Handling:** Clear, consistent error messages
- ✅ **Security:** Rejects invalid input before business logic
- ✅ **Performance:** Fails fast on invalid input
- ✅ **Maintainability:** Single source of truth for validation rules

## Related Documentation

- `server/schemas/validation.ts` - All schema definitions
- `server/middleware/validation.ts` - Middleware utilities
- OWASP: https://owasp.org/www-community/attacks/injection-sql
