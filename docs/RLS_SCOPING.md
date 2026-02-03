# RLS Scoping Strategy: Reduce Service Role Key Dependency

## Overview

This document describes the refactoring strategy to reduce reliance on Supabase's Service Role Key and enforce Row Level Security (RLS) policies across the application.

## Problem Statement

**Before Refactoring:**

- All backend routes created Supabase clients using `SUPABASE_SERVICE_KEY`
- Service Role Key bypasses all RLS policies
- Administrative routes with elevated access could be exploited if authentication was weak
- No enforcement of user-scoped data access at the database level

**Security Risk:**
If authentication middleware is compromised or bypassed, Service Role Key usage means RLS policies provide no protection.

## Solution: Scoped Supabase Clients

### Architecture

#### 1. Service Role Client (Deprecated for most use cases)

**Location:** `server/utils/supabase.ts`

```typescript
export const supabase = createClient(supabaseUrl, keyToUse, {...});
```

**Usage:**

- ✅ Background jobs and scheduled tasks
- ✅ Database migrations
- ✅ Admin-only operations that explicitly check authorization
- ✅ Public endpoints that don't require authentication
- ❌ Customer-facing endpoints

**Comment Requirements:**
When Service Role Key is required, add inline comment:

```typescript
// SECURITY: Service Role Key required for [specific justification]
// Alternative: [explain why RLS-scoped approach won't work]
const { data } = await supabase.from("table").select("*");
```

#### 2. Scoped Client with JWT

**Location:** `server/utils/supabase.ts`

```typescript
export function createScopedSupabaseClient(userJwt: string): SupabaseClient {
  return createClient(supabaseUrl, userJwt, {...});
}

export function getScopedSupabaseClient(req: any): SupabaseClient {
  if (req.userJwt) {
    return createScopedSupabaseClient(req.userJwt);
  }
  return supabase; // Falls back to service role for public endpoints
}
```

**How It Works:**

1. JWT token passed to Supabase client
2. Supabase uses JWT's claims to identify authenticated user
3. RLS policies check `auth.uid()` and other JWT claims
4. Database enforces access control, not just application code

**Example RLS Policy:**

```sql
CREATE POLICY "Customers can only access their own data"
  ON customers
  FOR SELECT
  USING (auth.uid() = id::text);
```

### Migration Path

#### Phase 1: Add Scoped Client Infrastructure (✅ COMPLETE)

- [x] Export `createScopedSupabaseClient()` function
- [x] Export `getScopedSupabaseClient()` helper
- [x] Update auth middleware to store JWT in request
- [x] Add `userJwt` property to Express Request interface

#### Phase 2: Refactor Customer-Facing Routes

Routes that should use scoped clients (enforce RLS):

| Route Module                    | Endpoints                           | Status         |
| ------------------------------- | ----------------------------------- | -------------- |
| `server/routes/customers.ts`    | GET/PUT customer profile, addresses | ✅ Refactored  |
| `server/routes/orders.ts`       | GET orders, order status            | 🔄 In Progress |
| `server/routes/designs.ts`      | Upload design, get designs          | Pending        |
| `server/routes/checkout.ts`     | Create order, payment               | Pending        |
| `server/routes/store-credit.ts` | Get/update store credit             | Pending        |
| `server/routes/support.ts`      | Support tickets                     | Pending        |
| `server/routes/invoices.ts`     | Get customer invoices               | Pending        |

#### Phase 3: Document Service Role Usage

Routes that require Service Role Key with justification:

| Route Module                       | Endpoints                     | Justification                                                  |
| ---------------------------------- | ----------------------------- | -------------------------------------------------------------- |
| `server/routes/admin-products.ts`  | Create/update/delete products | Admin-only; requires elevated access for bulk operations       |
| `server/routes/admin-orders.ts`    | View all orders, debug        | Admin-only; explicitly requires `verifyToken` + `requireAdmin` |
| `server/routes/admin-customers.ts` | Customer management           | Admin-only; explicitly requires `verifyToken` + `requireAdmin` |
| `server/routes/blogs.ts`           | Manage blogs                  | Admin-only; requires elevated access                           |
| `server/routes/webhooks.ts`        | Process webhooks              | Public endpoint; doesn't require auth                          |
| `server/routes/auth.ts`            | Login, signup                 | Authentication setup; requires service role                    |

## Implementation Guidelines

### For Customer-Facing Routes

**Pattern:**

```typescript
import { getScopedSupabaseClient } from "../utils/supabase";

export const handleGetCustomerData: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as any).customerId;
    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // SECURITY: Use scoped client to enforce RLS policies
    // Customer can only access their own data
    const scoped = getScopedSupabaseClient(req);

    const { data } = await scoped
      .from("table")
      .select("*")
      .eq("customer_id", customerId);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### For Admin Routes

**Pattern:**

```typescript
// SECURITY: Service Role Key required for admin bulk operations
// RLS cannot be enforced for operations spanning multiple customers
// Alternative: None - admin needs unrestricted access
const { data } = await supabase
  .from("orders")
  .select("*, customers(*)")
  .eq("status", "pending");
```

### For Public Endpoints

**Pattern:**

```typescript
// Public endpoint (no authentication required)
// getScopedSupabaseClient() falls back to service role (no RLS applied)
const scoped = getScopedSupabaseClient(req);

const { data } = await scoped
  .from("products")
  .select("*")
  .eq("availability", true);
```

## RLS Policy Requirements

### Required Database Policies

Each table accessed via scoped client must have RLS policies:

```sql
-- Enable RLS on table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Customer can only access own record
CREATE POLICY "Customers can view own profile"
  ON customers
  FOR SELECT
  USING (auth.uid() = id::text);

-- Customer can only update own record
CREATE POLICY "Customers can update own profile"
  ON customers
  FOR UPDATE
  USING (auth.uid() = id::text);

-- Admin can access all (requires admin auth token)
CREATE POLICY "Admins can access all customers"
  ON customers
  FOR SELECT
  USING (auth.jwt() ->> 'is_admin' = 'true');
```

### Verification Checklist

- [ ] All customer-facing tables have RLS enabled
- [ ] RLS policies check `auth.uid()` against user identifier
- [ ] RLS policies prevent cross-customer data access
- [ ] Admin policies explicitly check admin role
- [ ] Public read policies are explicitly defined (no implicit access)
- [ ] Sensitive tables (orders, addresses) require RLS

## Testing RLS Enforcement

### Test 1: Scoped Client Respects RLS

```bash
# Customer A tries to access Customer B's data
# Expected: Empty result or 404 error

curl -H "Authorization: Bearer CUSTOMER_B_JWT" \
  /api/customers/123  # Customer A's ID
```

### Test 2: Service Role Bypasses RLS (Admin use case)

```bash
# Backend admin operation uses service role
# Expected: Full access regardless of customer_id

const { data } = await supabase
  .from("customers")
  .select("*");  // No WHERE clause - gets all customers
```

### Test 3: Missing JWT Falls Back to Service Role

```bash
# Public endpoint without authentication
// SECURITY: getScopedSupabaseClient() returns service role client
const scoped = getScopedSupabaseClient(req);  // req.userJwt is undefined
// Public policies allow access
```

## Migration Checklist

### 1. Audit Existing Routes

- [ ] List all routes using `createClient(supabaseUrl, SERVICE_KEY)`
- [ ] Categorize by: customer-facing, admin, public, background jobs
- [ ] Document why SERVICE_KEY is needed for each

### 2. Refactor Customer Routes

- [ ] Replace local `createClient()` with `getScopedSupabaseClient(req)`
- [ ] Add security comment explaining RLS enforcement
- [ ] Verify auth middleware provides `req.userJwt`
- [ ] Test with multiple customer JWTs

### 3. Update Admin Routes

- [ ] Keep SERVICE_KEY usage
- [ ] Add inline comment explaining why elevated access is needed
- [ ] Verify `verifyToken` + `requireAdmin` middleware is applied
- [ ] Verify audit logging is in place

### 4. Configure RLS Policies

- [ ] Enable RLS on all user-scoped tables
- [ ] Create policies for customer access
- [ ] Create policies for admin access
- [ ] Test policies with scoped clients

### 5. Documentation

- [ ] Update this file with completed refactoring
- [ ] Add comments to routes explaining RLS strategy
- [ ] Document which tables have RLS enabled
- [ ] Document JWT claims used in RLS policies

## Benefits

### Security

✅ **Defense in Depth:** Database enforces access control, not just application code
✅ **No Single Point of Failure:** Compromised auth middleware doesn't grant full database access
✅ **RLS Protection:** Even if authentication is weak, RLS policies protect data
✅ **Audit Trail:** Database logs all access by authenticated user

### Maintainability

✅ **Clear Authorization:** RLS policies are visible in database schema
✅ **Easier Testing:** Can test RLS directly with different JWT tokens
✅ **Compliance:** RLS policies satisfy security audit requirements
✅ **Documentation:** Policies serve as executable documentation

### Performance

✅ **Filtered at Source:** Database returns only accessible rows (no post-processing)
✅ **No N+1 Queries:** RLS policies prevent need for manual permission checks
✅ **Scalable:** RLS doesn't slow down as user base grows

## Troubleshooting

### "Permission denied" errors from scoped client

**Cause:** RLS policy blocking access
**Check:**

1. Is RLS enabled on the table?
2. Does RLS policy match the user's auth.uid()?
3. Is the user's JWT being passed correctly?
4. Test with service role client to isolate RLS issue

### Scoped client returns empty results

**Cause:** RLS policy too restrictive
**Check:**

1. Verify `auth.uid()` in RLS policy matches table's user identifier
2. Check JWT token has correct `sub` claim (user ID)
3. Test policy: `SELECT * FROM table WHERE auth.uid() = user_id`

### Admin operations failing with scoped client

**Cause:** RLS policies don't include admin exemption
**Check:**

1. Use service role client for admin operations
2. Or add RLS policy: `CREATE POLICY "Admins bypass RLS" ... USING (auth.jwt() ->> 'is_admin' = 'true')`
3. Ensure JWT includes `is_admin` claim

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

## Related Documentation

- `docs/SECURITY.md` - Environment security and secret management
- `docs/DEBUG_ENDPOINTS.md` - Admin endpoint security
- `docs/UPLOAD_SECURITY.md` - File upload security
