# Public Access Token Security Model

## Overview

This document describes the implementation of cryptographically secure public access tokens to replace guessable identifier-based access to sensitive operations.

## Problem Statement

**CRITICAL VULNERABILITIES IDENTIFIED:**

Public action endpoints currently accept guessable identifiers (UUIDs, proof IDs, order IDs) without any additional validation:

1. **Proof Operations** (HIGH RISK)
   - `GET /api/proofs/:proofId` - View proof details
   - `POST /api/proofs/:proofId/approve` - Approve proof
   - `POST /api/proofs/:proofId/revise` - Request revisions
   - `POST /api/proofs/:proofId/deny` - Deny proof
   - **Issue**: Any attacker can enumerate proof IDs and approve/deny arbitrary proofs

2. **Order Operations** (MEDIUM RISK)
   - `GET /api/public/orders/:orderId` - View order status
   - **Issue**: Numeric order IDs are guessable; any attacker can view any order

3. **Invoice Operations**
   - `GET /api/invoices/:invoiceId/pay` - View invoice for payment
   - **Issue**: Numeric invoice IDs are guessable

## Solution: Cryptographic Token-Based Access

### Token Design

Each public access operation now requires a **secure public access token**:

- **Format**: 64 hex characters (32 random bytes from crypto.randomBytes)
- **Example**: `a3f7d9c2b1e8f4a6c5d2e9b3f7a1c4d8e2b5f8a1c4d7e9b2c5f8a1e4d7c0b`
- **Generation**: Cryptographically secure random (not guessable)
- **Storage**: Encrypted in database with metadata

### Token Lifecycle

1. **Generation**: Token created when resource is first shared
   - Triggered by admin/system when sending proof review email
   - Triggered by customer when requesting public order link
2. **Storage**: Token stored in `public_access_tokens` table

   ```
   id | token (unique) | resource_type | resource_id | expires_at | one_time_use | used_at | created_at
   ```

3. **Validation**:
   - Token must exist and not be expired
   - Token must match requested resource type and ID
   - If one-time-use, token must not have been used before
   - All failures return generic 404 (prevents enumeration)

4. **Expiration**:
   - Default: 48 hours from creation
   - Customizable per use case (e.g., 72 hours for invoices)
   - Expired tokens automatically cleaned up

5. **One-Time Use** (optional):
   - Some operations (approval links) can be one-time-use
   - After first successful use, token is marked as used
   - Subsequent uses with same token return 404

### Security Properties

✅ **Prevents Enumeration**: Token is cryptographically random, not guessable
✅ **Prevents IDOR**: Resource ID locked to token; token for proof can't access order
✅ **Prevents Reuse**: Optional one-time-use for sensitive operations
✅ **Time-Limited**: Tokens expire, forcing re-verification
✅ **Generic Errors**: All failures return 404, no information leakage
✅ **Atomic Validation**: Token + resource verification in single query
✅ **Never Logged**: Tokens are never written to logs (only prefix for debugging)
✅ **Server-Side Only**: Tokens never stored in browser localStorage

## Implementation Status

### ✅ COMPLETED

1. **Token Utility Functions** (`server/utils/public-access-tokens.ts`)
   - `generatePublicAccessToken()` - Generate secure token
   - `createPublicAccessToken()` - Store token in database
   - `validatePublicAccessToken()` - Validate token atomically
   - `revokePublicAccessToken()` - Revoke single token
   - `revokeResourceTokens()` - Revoke all tokens for resource
   - `cleanupExpiredTokens()` - Background cleanup job

2. **Database Migration** (`supabase/migrations/20250204_create_public_access_tokens.sql`)
   - Created `public_access_tokens` table
   - Added proper indexes for token lookup, resource lookup, expiration
   - Restricted permissions to prevent direct access

3. **Proof Endpoints Refactored**
   - `handleGetProofDetailPublic` - Now requires token in query string
   - `handleApproveProofPublicNew` - Now requires token, one-time-use
   - `handleReviseProofPublicNew` - Now requires token, one-time-use
   - `handleApproveProofPublic` - Now requires token, one-time-use
   - `handleDenyProofPublic` - Now requires token, one-time-use

### 🔄 IN PROGRESS

4. **Order Endpoints Refactoring**
   - `handleGetOrderPublic` - Update to require token
   - Token generation when orders are created

5. **Email/Link Generation**
   - Update proof email templates to include token
   - Update order status emails to include token
   - Update invoice payment links to include token

6. **Token Generation on Create**
   - Generate tokens when proofs are created
   - Generate tokens when orders are created
   - Generate tokens when invoices are created

### 🔄 PENDING

7. **Rate Limiting**
   - Add rate limiting to public token validation endpoints
   - Prevent token enumeration/brute force attacks
   - Implement exponential backoff for failed attempts

8. **Invoice Endpoints**
   - `handleGetInvoiceByToken` - Already secure (uses token)
   - Ensure invoice payment operations use tokens

9. **Design Upload Endpoints**
   - Check if design upload is publicly accessible
   - If so, require token for file uploads

10. **Cleanup Tasks**
    - Set up cron job to cleanup expired tokens daily
    - Add monitoring for token usage patterns
    - Add audit logging for sensitive operations

## Usage Examples

### Before (INSECURE)

```bash
# Attacker can guess and enumerate proof IDs
curl -X POST https://api.stickerland.com/api/proofs/uuid-1234/approve
curl -X POST https://api.stickerland.com/api/proofs/uuid-1235/approve
curl -X POST https://api.stickerland.com/api/proofs/uuid-1236/approve
# ... iterate through all UUIDs
```

### After (SECURE)

```bash
# Token is cryptographically random, not guessable
curl -X POST 'https://api.stickerland.com/api/proofs/uuid-1234/approve?token=a3f7d9c2b1e8f4a6c5d2e9b3f7a1c4d8e2b5f8a1c4d7e9b2c5f8a1e4d7c0b'

# If token is wrong, expired, or already used:
# Returns: { "error": "Proof not found" }  (generic 404)
# Attacker learns nothing about whether proof ID exists
```

### Email Link Generation

```typescript
// When sending proof review email:
const token = await createPublicAccessToken({
  resourceType: "proof",
  resourceId: proof.id,
  expiresInHours: 72,
  oneTimeUse: true,
  createdBy: "admin@stickerland.com",
});

// Email link includes token:
// https://stickerland.app/proofs/review?token=<token>

// Frontend redirects to:
// GET /api/proofs/public/detail?token=<token>
```

## Database Schema

```sql
CREATE TABLE public_access_tokens (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  resource_type VARCHAR(50) NOT NULL,  -- 'proof', 'order', 'invoice', 'design'
  resource_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  one_time_use BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255),
  metadata JSONB
);
```

## Endpoint Changes Summary

### Proof Endpoints (COMPLETED)

| Endpoint                          | Change                             | Status |
| --------------------------------- | ---------------------------------- | ------ |
| GET /api/proofs/:proofId/public   | Path param → Query token           | ✅     |
| POST /api/proofs/:proofId/approve | Path param → Query token, one-time | ✅     |
| POST /api/proofs/:proofId/revise  | Path param → Query token, one-time | ✅     |
| POST /api/proofs/:proofId/deny    | Path param → Query token, one-time | ✅     |

### Order Endpoints (IN PROGRESS)

| Endpoint                        | Change                                    | Status |
| ------------------------------- | ----------------------------------------- | ------ |
| GET /api/public/orders/:orderId | Numeric ID → Query token                  | 🔄     |
| POST /api/public/orders/verify  | Already secure (email/phone verification) | ✅     |
| GET /api/public/order-status    | Already secure (uses public_access_token) | ✅     |

### Invoice Endpoints (PENDING)

| Endpoint                              | Change                   | Status |
| ------------------------------------- | ------------------------ | ------ |
| GET /api/invoices/:invoiceId/pay      | Numeric ID → Query token | 🔄     |
| POST /api/invoices/:invoiceId/payment | Numeric ID → Query token | 🔄     |

## Testing Strategy

### Unit Tests (for token utilities)

```typescript
test("generatePublicAccessToken generates 64 hex characters", () => {
  const token = generatePublicAccessToken();
  expect(token).toMatch(/^[0-9a-f]{64}$/);
});

test("validatePublicAccessToken rejects expired tokens", async () => {
  const result = await validatePublicAccessToken(expiredToken, "proof");
  expect(result.success).toBe(false);
  expect(result.error).toBe("Not found"); // Generic error
});
```

### Integration Tests (for endpoints)

```typescript
test('POST /api/proofs/:id/approve requires valid token', async () => {
  const response = await POST('/api/proofs/123/approve?token=invalid');
  expect(response.status).toBe(404);
  expect(response.body.error).toBe('Proof not found');
});

test('POST /api/proofs/:id/approve with valid token succeeds', async () => {
  const token = await createPublicAccessToken({...});
  const response = await POST(`/api/proofs/123/approve?token=${token}`);
  expect(response.status).toBe(200);
  expect(response.body.status).toBe('approved');
});
```

### Security Tests

```typescript
test('Token cannot be reused (one-time-use)', async () => {
  const token = await createPublicAccessToken({oneTimeUse: true, ...});

  // First use succeeds
  let response = await POST(`/api/proofs/123/approve?token=${token}`);
  expect(response.status).toBe(200);

  // Second use fails
  response = await POST(`/api/proofs/123/approve?token=${token}`);
  expect(response.status).toBe(404);
});

test('Enumeration attack is prevented', async () => {
  const results = [];
  for (let i = 0; i < 100; i++) {
    const fakeToken = randomHex(64);
    const response = await GET(`/api/proofs/public?token=${fakeToken}`);
    results.push(response.status);
  }

  // All should be 404, no information leakage
  expect(results.every(status => status === 404)).toBe(true);
});
```

## Deployment Checklist

- [ ] Run database migration: `20250204_create_public_access_tokens.sql`
- [ ] Deploy server code with token utilities
- [ ] Deploy proof endpoint refactoring
- [ ] Update email templates with secure tokens
- [ ] Deploy order endpoint refactoring
- [ ] Update order status email templates
- [ ] Update invoice templates
- [ ] Deploy rate limiting middleware
- [ ] Set up cron job for token cleanup
- [ ] Add monitoring and alerting for token usage
- [ ] Test all public endpoints with tokens
- [ ] Update API documentation
- [ ] Notify customers of new link format (if customer-facing)

## Rollback Plan

If issues occur:

1. Keep old endpoints active in parallel during transition
2. Use feature flag to switch between old and new endpoints
3. Monitor error rates for new endpoints
4. Can rollback by disabling feature flag

## Future Enhancements

1. **Token Hashing**: Hash tokens before storage (requires slower validation)
2. **IP Binding**: Optionally bind token to requester IP address
3. **Rate Limiting**: Add per-token rate limits
4. **Analytics**: Track token usage, expiration patterns
5. **Signing**: Use HMAC-SHA256 to sign tokens (no DB lookup needed)
6. **QR Codes**: Generate QR codes with embedded tokens for print media
7. **Webhook Verification**: Use tokens to verify webhook authenticity

## References

- OWASP: Insecure Direct Object References (IDOR)
- OWASP: Broken Authentication
- RFC 6234: US Secure Hash and HMAC-SHA Algorithms
- Supabase RLS: Row Level Security
