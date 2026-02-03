# Server Architecture: Modular Router Design

## Overview

The server has been refactored from a monolithic `server/index.ts` file (~1280 lines) into modular router files. This improves maintainability, readability, and allows teams to work on different features independently.

## Architecture Pattern

### Bootstrap vs Route Logic

```
server/index.ts
├── Environment setup (dotenv)
├── Express app initialization
├── CORS configuration
├── Middleware setup (express.json, rate limiting, security headers)
├── Router mounting
└── Error handling
```

This separation ensures `server/index.ts` remains focused on **server configuration** while route logic lives in dedicated modules.

## Router Structure

### Pattern: Router Factories

Each router module exports a factory function that returns an Express Router:

```typescript
// server/routes/auth.router.ts
export function createAuthRouter() {
  const router = Router();

  router.post("/login", authLimiter, handleLogin);
  router.post("/signup", authLimiter, handleSignup);
  // ...

  return router;
}
```

**Benefits:**

- Dependency injection (pass multer, middleware, etc.)
- Lazy route registration
- Testability (routers can be imported in tests)
- Reusability (same router can be mounted at multiple paths)

### Usage in main server

```typescript
// server/index.ts
app.use("/api/auth", createAuthRouter());
app.use("/api/customers", createCustomerRouter(upload));
app.use("/api/orders", createOrderRouter());
```

## Current Router Modules

### Tier 1: Core Feature Routers (Implemented)

| Router       | File                 | Routes                                                               | Status      |
| ------------ | -------------------- | -------------------------------------------------------------------- | ----------- |
| **Auth**     | `auth.router.ts`     | `/api/auth/*`                                                        | ✅ Complete |
| **Customer** | `customer.router.ts` | `/api/customers/*`                                                   | ✅ Complete |
| **Orders**   | `order.router.ts`    | `/api/orders/*`, `/api/admin/orders/*`, `/api/public/orders/*`       | ✅ Complete |
| **Products** | `product.router.ts`  | `/api/products/*`, `/api/admin/products/*`, `/api/public/products/*` | ✅ Complete |

### Tier 2: Secondary Feature Routers (To Be Created)

| Router        | File                 | Routes                                             | Status     |
| ------------- | -------------------- | -------------------------------------------------- | ---------- |
| **Designs**   | `design.router.ts`   | `/api/designs/*`                                   | ⏳ Pending |
| **Cart**      | `cart.router.ts`     | `/api/cart/*`                                      | ⏳ Pending |
| **Checkout**  | `checkout.router.ts` | `/api/checkout/*`                                  | ⏳ Pending |
| **Payments**  | `payment.router.ts`  | `/api/payments/*`, `/api/square/*`                 | ⏳ Pending |
| **Reviews**   | `review.router.ts`   | `/api/reviews/*`, `/api/admin/reviews/*`           | ⏳ Pending |
| **Support**   | `support.router.ts`  | `/api/support/*`, `/api/admin/tickets/*`           | ⏳ Pending |
| **Proofs**    | `proof.router.ts`    | `/api/proofs/*`, `/api/admin/proofs/*`             | ⏳ Pending |
| **Shipping**  | `shipping.router.ts` | `/api/shipping/*`, `/api/admin/shipping-options/*` | ⏳ Pending |
| **Discounts** | `discount.router.ts` | `/api/discounts/*`, `/api/admin/discounts/*`       | ⏳ Pending |

### Tier 3: Integration & Admin Routers (To Be Created)

| Router                | File                      | Routes                                                                     | Status     |
| --------------------- | ------------------------- | -------------------------------------------------------------------------- | ---------- |
| **Admin Core**        | `admin.router.ts`         | `/api/admin/customers/*`, `/api/admin/analytics/*`, `/api/admin/finance/*` | ⏳ Pending |
| **Content**           | `content.router.ts`       | `/api/blogs/*`, `/api/legal-pages/*`                                       | ⏳ Pending |
| **Digital Files**     | `digital-file.router.ts`  | `/api/orders/:orderId/files/*`                                             | ⏳ Pending |
| **Webhooks**          | `webhook.router.ts`       | `/api/webhooks/*`, `/api/zapier/*`                                         | ⏳ Pending |
| **Ecwid Integration** | `ecwid.router.ts`         | `/api/ecwid-products/*`, `/api/admin/ecwid/*`                              | ⏳ Pending |
| **Invoices**          | `invoice.router.ts`       | `/api/admin/invoices/*`, `/api/invoice/*`                                  | ⏳ Pending |
| **Email Preview**     | `email-preview.router.ts` | `/api/email-preview/*`                                                     | ⏳ Pending |

## Router Implementation Guidelines

### 1. File Naming Convention

```
Feature Name        → Router File
----------          → -----------
Authentication      → auth.router.ts
Product Management  → product.router.ts
Order Management    → order.router.ts
Customer Profile    → customer.router.ts
```

**Pattern:** `{feature}.router.ts` (always lowercase, kebab-case)

### 2. Route Path Organization

Within a router, organize routes by:

1. **HTTP Method** (GET, POST, PUT, DELETE)
2. **Specificity** (specific paths before parameterized paths)
3. **Protection Level** (public → protected → admin)

```typescript
export function createBlogRouter() {
  const router = Router();

  // ===== PUBLIC ROUTES =====
  router.get("/", handleGetPublishedBlogs); // GET /api/blogs
  router.get("/:blogId", handleGetBlogById); // GET /api/blogs/:blogId

  // ===== ADMIN ROUTES =====
  router.post("/", verifyToken, requireAdmin, handleCreateBlog); // POST /api/admin/blogs
  router.get("/admin/list", verifyToken, requireAdmin, handleGetAllBlogs); // GET /api/admin/blogs
  router.put("/:blogId", verifyToken, requireAdmin, handleUpdateBlog); // PUT /api/admin/blogs/:blogId
  router.delete("/:blogId", verifyToken, requireAdmin, handleDeleteBlog); // DELETE /api/admin/blogs/:blogId

  return router;
}
```

### 3. Middleware Placement

Place middleware in the order handler arguments, **not** in the router factory:

```typescript
// ✅ CORRECT: Middleware in route handler
router.post(
  "/",
  verifyToken, // Authentication
  requireAdmin, // Authorization
  handleCreateBlog, // Handler
);

// ❌ AVOID: Middleware in factory
const router = Router();
router.use(verifyToken); // Don't do this
```

This keeps middleware decisions visible at the route level.

### 4. Parameter Routes Must Come After Specific Routes

```typescript
// ✅ CORRECT: Specific routes first
router.get("/admin/list", ...);     // More specific
router.get("/:blogId", ...);        // Parameter route (less specific)

// ❌ WRONG: Parameter route catches specific routes
router.get("/:blogId", ...);        // Catches /admin/list too!
router.get("/admin/list", ...);     // Never reached
```

## Migrating Existing Routes to Routers

### Step-by-Step Process

#### 1. Create Router File

```typescript
// server/routes/example.router.ts
import { Router } from "express";
import { verifyToken, requireAdmin } from "../middleware/auth";
import {
  handleListItems,
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
} from "./example";

export function createExampleRouter() {
  const router = Router();

  // Routes here...

  return router;
}
```

#### 2. Extract Routes from server/index.ts

Copy the route registrations from the original file:

```typescript
// FROM server/index.ts:
app.get("/api/example", verifyToken, handleListItems);
app.post("/api/example", verifyToken, requireAdmin, handleCreateItem);
app.put("/api/example/:id", verifyToken, requireAdmin, handleUpdateItem);
app.delete("/api/example/:id", verifyToken, requireAdmin, handleDeleteItem);

// BECOMES in example.router.ts:
router.get("/", verifyToken, handleListItems);
router.post("/", verifyToken, requireAdmin, handleCreateItem);
router.put("/:id", verifyToken, requireAdmin, handleUpdateItem);
router.delete("/:id", verifyToken, requireAdmin, handleDeleteItem);
```

Note: `/api/example` prefix becomes the path when mounting (see step 3)

#### 3. Mount Router in server/index.ts

```typescript
// server/index.ts
import { createExampleRouter } from "./routes/example.router";

// Later in createServer():
app.use("/api/example", createExampleRouter());
```

#### 4. Remove Original Route Registrations

Delete all the individual `app.get()`, `app.post()`, etc. calls that are now in the router.

## Backwards Compatibility

All routes maintain their original paths. For example:

```typescript
// Before refactoring
app.get("/api/products/:id", handleGetProduct);

// After refactoring (same path, different implementation)
app.use("/api/products", createProductRouter());
// Router has: router.get("/:id", handleGetProduct);
```

**Result:** `/api/products/:id` continues to work identically.

## Middleware Ordering (Critical)

Express executes middleware/routers in registration order:

```typescript
// Order matters!
app.use(corsMiddleware); // 1. CORS first
app.use(express.json()); // 2. JSON parsing
app.use(securityHeaders); // 3. Security headers
app.use(rateLimit); // 4. Rate limiting

app.use("/api/auth", createAuthRouter()); // 5. Routes
app.use("/api/customers", createCustomerRouter());
// ...

app.use(globalErrorHandler); // Last: Error handling
```

**When adding new routers, maintain this order.**

## Testing Routers

### Unit Test Pattern

```typescript
import { Router } from "express";
import { createExampleRouter } from "../example.router";

describe("Example Router", () => {
  let app: Express;
  let router: Router;

  beforeEach(() => {
    router = createExampleRouter();
    // Test the router in isolation
  });

  it("should have GET / route", () => {
    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: layer.route.methods,
      }));

    expect(routes).toContainEqual({
      path: "/",
      methods: { get: true },
    });
  });
});
```

### Integration Test Pattern

```typescript
describe("Products API", () => {
  let app: Express;

  beforeEach(() => {
    app = createServer();
  });

  it("GET /api/products/:id returns product", async () => {
    const response = await request(app).get("/api/products/1").expect(200);

    expect(response.body).toHaveProperty("id", 1);
  });
});
```

## File Size Reduction

### Before Refactoring

- `server/index.ts`: ~1280 lines
- Many nested imports (250+ lines of imports)
- 500+ lines of route registrations

### After Refactoring (Current)

- `server/index.ts`: ~450 lines (65% reduction)
- Focused on setup and mounting
- Each router 40-80 lines (focused)

## Phase 2: Remaining Refactoring

To continue refactoring the remaining routes:

1. **Identify route group** (e.g., "checkout routes")
2. **Create `{feature}.router.ts`** file
3. **Extract handlers** from `server/index.ts`
4. **Implement router** following the pattern above
5. **Mount router** in `server/index.ts`
6. **Delete original route registrations**
7. **Test** that routes still work

## Related Documentation

- `docs/REQUEST_VALIDATION.md` - Input validation patterns
- `docs/RLS_SCOPING.md` - Security policies
- `docs/DEBUG_ENDPOINTS.md` - Admin debugging routes

## Performance Notes

- Router factories are called once on server startup
- No performance impact vs. original inline routes
- Router matching uses the same Express algorithm
- Memory usage is identical or slightly reduced
