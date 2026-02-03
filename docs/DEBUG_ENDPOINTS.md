# Debug Endpoints Security

## Overview

Debug endpoints provide admin access to diagnostic information about the system. All debug endpoints are now protected by:

1. **Authentication** (`verifyToken` middleware)
2. **Authorization** (`requireAdmin` middleware)
3. **Audit Logging** (all access is logged)

**NO LONGER rely on NODE_ENV checks** for security control.

---

## Available Debug Endpoints

### 1. GET /api/debug/orders-list

**Purpose:** View all orders with customer information for admin troubleshooting

**Authentication:** Required

- Header: `Authorization: Bearer <JWT_TOKEN>`
- User must have admin role

**Response:**

```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "display_number": "SY-54001",
      "created_at": "2025-01-15T10:30:00Z",
      "status": "paid",
      "total": 99.99,
      "customer_id": 123,
      "customer_email": "user@example.com"
    }
  ],
  "total": 1,
  "_debug": {
    "endpoint": "/api/debug/orders-list",
    "protected_by": ["verifyToken", "requireAdmin"],
    "accessed_by_admin": 123,
    "timestamp": "2025-02-03T15:45:00Z"
  }
}
```

**Exposed Data:**

- Order IDs, dates, status, totals
- Customer IDs and EMAIL ADDRESSES (PII)

**Admin Only:** YES

**Audit Logged:** YES

---

### 2. GET /api/debug/health

**Purpose:** Check system health and configuration status

**Authentication:** Required

- Header: `Authorization: Bearer <JWT_TOKEN>`
- User must have admin role

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "connected": true,
    "error": null
  },
  "configuration": {
    "SUPABASE_URL": true,
    "SUPABASE_SERVICE_KEY": true,
    "JWT_SECRET": true,
    "CLOUDINARY_CLOUD_NAME": true,
    "SQUARE_APPLICATION_ID": true,
    "SQUARE_ACCESS_TOKEN": true,
    "RESEND_API_KEY": true,
    "ECWID_API_TOKEN": true
  },
  "node_env": "production",
  "timestamp": "2025-02-03T15:45:00Z",
  "_debug": {
    "endpoint": "/api/debug/health",
    "protected_by": ["verifyToken", "requireAdmin"],
    "accessed_by_admin": 123
  }
}
```

**Exposed Data:**

- Which environment variables are configured (not their values)
- Database connectivity status
- Node environment (development/production)

**Admin Only:** YES

**Audit Logged:** YES

---

## Security Architecture

### Before (Vulnerable)

```
Request
  ↓ Check: NODE_ENV !== "production"?
  ├─ YES → Allow access (NO authentication required)
  └─ NO → Reject access
```

**Problems:**

- Environment variable can be spoofed
- No actual authentication
- No authorization checks
- PII exposed without verification
- No audit trail

### After (Secure)

```
Request
  ↓ verifyToken middleware
  ├─ Valid JWT? → Continue
  └─ Invalid/missing → 401 Unauthorized
  ↓ requireAdmin middleware
  ├─ User is admin? → Continue
  └─ Not admin → 403 Forbidden
  ↓ Debug handler
  ├─ Log access
  ├─ Execute query
  └─ Return data
```

**Improvements:**

- ✅ Requires valid authentication token
- ✅ Requires admin role verification
- ✅ All access is logged with timestamp and admin ID
- ✅ Works in any environment (dev, prod, staging)
- ✅ Can be disabled by removing routes entirely

---

## Access Control

### Who Can Access?

Only users who:

1. **Are authenticated** - Have a valid JWT token
2. **Are admins** - Database record has `is_admin = true`
3. **Have explicit permission** - The `requireAdmin` middleware verified their role

### Authentication Flow

1. Admin logs in via `/api/auth/login`
2. Server returns JWT token
3. Admin stores token in `localStorage.getItem("authToken")`
4. Admin makes request: `Authorization: Bearer <JWT>`
5. Server verifies token signature with `JWT_SECRET`
6. Server checks `customers.is_admin` flag in database
7. If both valid → Access granted

---

## Audit Logging

All debug endpoint access is logged to console:

```
[DEBUG ENDPOINT ACCESS] Admin 123 accessed /api/debug/orders-list at 2025-02-03T15:45:00.000Z
[DEBUG ENDPOINT ACCESS] Admin 456 accessed /api/debug/health at 2025-02-03T15:46:00.000Z
```

### Log Fields

- `[DEBUG ENDPOINT ACCESS]` - Log type
- `Admin <ID>` - Which admin accessed it
- `accessed /api/<endpoint>` - Which endpoint
- `at <timestamp>` - When (UTC)

### Recommended Monitoring

In production, forward these logs to:

- Datadog, Splunk, or ELK stack for monitoring
- Alert on suspicious patterns:
  - Multiple failed access attempts (401/403)
  - Access from unusual IPs
  - Access at unusual times
  - Access by new admins

---

## Removing/Disabling Endpoints

### Temporarily Disable

Comment out the route registration in `server/index.ts`:

```typescript
// DISABLED FOR SECURITY AUDIT
// app.get("/api/debug/orders-list", verifyToken, requireAdmin, handleDebugOrdersList);
// app.get("/api/debug/health", verifyToken, requireAdmin, handleDebugHealth);
```

### Permanently Remove

Delete:

1. Route registration in `server/index.ts`
2. Handler functions in `server/routes/debug.ts`
3. Import statement in `server/index.ts`

---

## Testing Debug Endpoints

### Test 1: Without Authentication

```bash
curl http://localhost:3000/api/debug/orders-list
# Expected: 401 Unauthorized
```

### Test 2: With Invalid Token

```bash
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:3000/api/debug/orders-list
# Expected: 401 Unauthorized
```

### Test 3: With Valid Token (Non-Admin)

```bash
# Get token from normal user login
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/debug/orders-list
# Expected: 403 Forbidden (not admin)
```

### Test 4: With Valid Admin Token

```bash
# Get token from admin login
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/debug/orders-list
# Expected: 200 OK with orders data
```

---

## Security Checklist

- [ ] All debug endpoints require `verifyToken` middleware
- [ ] All debug endpoints require `requireAdmin` middleware
- [ ] No debug endpoints use `NODE_ENV` for security
- [ ] Debug endpoints log all access with admin ID
- [ ] Endpoints return appropriate errors (401, 403)
- [ ] No hardcoded credentials in responses
- [ ] PII (emails) only returned to authenticated admins
- [ ] Tests confirm non-admins get 403 Forbidden
- [ ] Production environment has monitoring/alerts enabled
- [ ] Team knows how to disable endpoints if compromised

---

## Compliance

This implementation aligns with:

- **OWASP Top 10 2021 / A01:2021** - Broken Access Control
- **PCI-DSS 2.1** - Restrict access to system components by business need-to-know
- **SOC 2 Type II** - User access controls and audit trails
- **GDPR Article 32** - Data security and audit logging

---

## Changelog

### Version 2.0 (2025-02-03) - SECURITY UPDATE

- **REMOVED:** NODE_ENV-based access control for debug endpoints
- **ADDED:** `verifyToken` middleware requirement (authentication)
- **ADDED:** `requireAdmin` middleware requirement (authorization)
- **ADDED:** Audit logging for all debug endpoint access
- **ADDED:** `/api/debug/health` for configuration checking
- **FIXED:** Created dedicated `server/routes/debug.ts` module
- **IMPROVED:** Error handling with proper HTTP status codes (401, 403, 500)

### Version 1.0 (pre-2025-02-03)

- Debug endpoints protected by `NODE_ENV !== "production"`
- No authentication or authorization required
- No audit logging
- **DEPRECATED** - Security vulnerability
