# Section 2: Protect Public Verification & Lookup Endpoints From Abuse

## Vulnerability Analysis

### Identified Public Verification/Lookup Endpoints

#### 1. **Order Verification** (HIGH RISK)

**Endpoint**: `POST /api/public/orders/verify`
**Current Flow**:

```typescript
{
  order_number: "12345",        // Sequential numeric ID - guessable
  verification_field: "user@email.com" OR "5551234567"  // Can brute force
}
```

**Attack Vectors**:

- **Enumeration**: Attacker tries order_numbers 1-100000 to enumerate all orders
- **Brute Force**: Once valid order found, try common email patterns
- **Timing Analysis**: Slow DB query on invalid order vs fast on valid
- **Distributed Attack**: Multiple IPs trying different combinations
- **Sequential ID Abuse**: Knowing one valid order_number, attacker can guess others

**Risk Level**: 🔴 CRITICAL

- No rate limiting per order number
- No lockout after failed attempts
- Response times vary (timing attack)
- No hashing of identifiers for tracking

**Current Protection**: Basic validation only

---

#### 2. **Invoice Lookup** (HIGH RISK)

**Endpoint**: `GET /api/invoices/:invoiceId/token`
**Current Flow**:

```
invoice IDs likely sequential (1, 2, 3, ...)
```

**Attack Vectors**:

- **Sequential ID Enumeration**: Try invoice IDs 1-10000
- **Timing Attacks**: Different response times for valid vs invalid
- **Resource Existence Leak**: Know exactly which invoices exist

**Risk Level**: 🔴 CRITICAL

**Current Protection**: None specific

---

#### 3. **Payment Token Lookup** (MEDIUM RISK)

**Endpoint**: `POST /api/invoices/:invoiceId/payment`
**Attack Vectors**:

- Brute force invoice + amount combinations
- Sequential ID enumeration
- Timing-based detection of valid invoices

**Risk Level**: 🟠 HIGH

---

#### 4. **Design File Access** (MEDIUM RISK)

**Endpoint**: `POST /api/designs/upload` (if using sequential IDs)
**Attack Vectors**:

- Enumerate design IDs
- Access designs before payment
- Timing analysis to detect valid designs

**Risk Level**: 🟠 MEDIUM

---

## Protection Strategy: Progressive Rate Limiting with Lockout

### Tier 1: Normal Usage (First 3-5 Attempts)

```
Limit: 5 attempts per 15 minutes per IP
Backoff: None
Status: Normal
Action: Log normally
```

### Tier 2: Elevated Usage (6-10 Attempts)

```
Limit: 2 additional attempts per 15 minutes per IP
Backoff: 500ms forced delay
Status: Suspicious
Action: Log as warning, alert if pattern continues
```

### Tier 3: Attack Suspected (11-20 Attempts)

```
Limit: 1 attempt per 15 minutes per IP
Backoff: 2 second forced delay + CAPTCHA required
Status: Likely attack
Action: Log security event, trigger monitoring alert
```

### Tier 4: Attack Confirmed (20+ Attempts)

```
Limit: 0 - Temporary Lockout for 1 hour
Backoff: N/A
Status: Confirmed attack
Action: Block IP, alert security team, log incident
```

---

## Implementation Components

### 1. Identifier Hashing for Tracking

**Purpose**: Track attempt patterns without storing raw identifiers

**Strategy**:

```typescript
// Hash order_number to track attempts without storing actual number
const hash = hashIdentifier("order:12345");
// Store in rate limit key: IP:hash:12h-rolling-window
```

**Benefits**:

- No PII in logs/cache
- Can group similar patterns
- Hash collision unlikely (SHA-256)
- Complies with data minimization

---

### 2. Anti-Enumeration Response Masking

**Purpose**: All failures return identical responses (no information leakage)

**Current Problem**:

```
"Order not found" - Different from
"Customer email doesn't match" - Different from
"Email already verified" - Attackers learn structure
```

**Solution**:

```
All failures return:
{
  success: false,
  error: "Verification failed"  // Always identical
}

Response times: Always 500ms (artificially padded)
HTTP Status: Always 400 or 404 (consistent)
```

---

### 3. Timing Attack Prevention

**Purpose**: Prevent attackers from detecting valid resources via response time

**Current Problem**:

```
Valid order:   100ms (DB lookup succeeds fast)
Invalid order: 50ms (DB lookup fails immediately)
Attackers detect: Valid orders respond slower
```

**Solution**:

```
All responses: Minimum 500ms (padded with artificial delay if needed)
- Fast operation (50ms): Wait 450ms
- Slow operation (480ms): Wait 20ms
- Crypto operations (2000ms): Return as-is (>500ms already)
```

---

### 4. Identifier Normalization

**Purpose**: Prevent bypass via format manipulation

**Examples**:

```
Order Number: "12345" = "12,345" = "0x3039" (hex)
Email: "user@test.com" = "USER@TEST.COM" (case variation)
Phone: "555-123-4567" = "+1 (555) 123-4567" (formatting)
```

**Solution**:

```typescript
// All identifiers normalized before comparison
normalizeOrderNumber("12,345") → "12345"
normalizeEmail("USER@TEST.COM") → "user@test.com"
normalizePhone("(555) 123-4567") → "5551234567"
```

---

### 5. IP-Based Rate Limiting with Bypasses

**Problem**: Distributed attacks from multiple IPs

**Solution**:

```
Primary limit: Per IP (catches basic attacks)
Secondary limit: Per identifier (tracks attempts across IPs)
Tertiary limit: Global (DDoS protection)

Example:
- IP1 tries order_number 1-100: Limited per IP
- IP1:IP2:IP3 all try order_number 1: Limited per identifier
- 1000 IPs all try different orders: Global limit triggered
```

---

### 6. Progressive Delay Strategy

**Purpose**: Increase cost of attacks as severity increases

**Progression**:

```
Tier 1 (0-5 attempts):   0ms delay     - Normal usage
Tier 2 (6-10 attempts):  500ms delay   - Elevated
Tier 3 (11-20 attempts): 2000ms delay  - Attack suspected
Tier 4 (20+ attempts):   Blocked/Timeout - Attack confirmed
```

---

### 7. Suspicious Activity Detection

**Patterns that trigger alerts**:

```
Pattern A: High failure rate
- 10+ failed attempts in 1 hour
- Action: Increase rate limiting, monitor closely

Pattern B: Sequential enumeration
- Attempts like: order 1000, 1001, 1002...
- Action: Immediate lockout, alert security

Pattern C: Distributed attack
- Same order number tried from 50+ IPs
- Action: Block order from public lookup, alert

Pattern D: Credential stuffing
- Valid order found, then many email attempts
- Action: Lock order verification, require admin review

Pattern E: Known vulnerability scanning
- Requests to paths that don't exist
- Action: Block IP, log incident
```

---

### 8. Logging Strategy (No PII/Secrets)

**What to Log**:

```
✅ IP address (hashed if possible)
✅ Endpoint accessed
✅ Attempt count this window
✅ Rate limit tier
✅ Identifier (hashed, not full value)
✅ Result (success/failure)
✅ Response time
✅ User agent (to detect bots)
```

**What NOT to Log**:

```
❌ Full order numbers
❌ Email addresses
❌ Phone numbers
❌ Tokens or secrets
❌ Passwords or verification codes
❌ Customer names
❌ Payment information
```

**Example Log Entry**:

```json
{
  "timestamp": "2025-02-04T12:34:56Z",
  "event": "order_verification_attempt",
  "ip": "203.0.113.42",
  "identifier_hash": "sha256:a3f7d9c2...",
  "attempt": 7,
  "tier": 2,
  "result": "failed",
  "response_time_ms": 502,
  "user_agent_family": "Chrome"
}
```

---

## Implementation Plan

### Phase 1: Core Abuse Detection (Week 1)

1. Create identifier hashing utilities
2. Create progressive rate limiter
3. Create anti-enumeration middleware
4. Create timing attack prevention wrapper

### Phase 2: Integration (Week 2)

5. Refactor order verification endpoint
6. Refactor invoice endpoints
7. Refactor design endpoints
8. Add security logging

### Phase 3: Monitoring (Week 3)

9. Create security event detector
10. Create alerting rules
11. Create monitoring dashboard
12. Load test with simulated attacks

### Phase 4: Documentation (Week 4)

13. Complete security documentation
14. Create incident response guide
15. Create admin playbook

---

## Success Criteria

✅ All public endpoints return identical error responses
✅ Response times normalized (all ≥500ms minimum)
✅ No timing-based information leakage
✅ Attack patterns detected within 5 minutes
✅ Attackers blocked within 20 minutes
✅ Zero PII in logs
✅ Rate limiting prevents 99% of enumeration attempts
✅ Legitimate users (1-2 attempts) unaffected

---

## Testing Strategy

### Security Testing

```bash
# Test 1: Enumeration prevention
for i in {1000..1100}; do
  curl "GET /api/orders/verify?order=$i&email=test@test.com"
done
# Expect: All fail identically, attacker rate limited by attempt 10

# Test 2: Timing attack prevention
time curl "GET /api/orders/verify?order=999999&email=test@test.com"  # Invalid
time curl "GET /api/orders/verify?order=1&email=test@test.com"      # Maybe valid
# Expect: Response times identical (±50ms)

# Test 3: Distributed attack prevention
for ip in 10.0.0.{1..100}; do
  for i in {1..10}; do
    curl -H "X-Forwarded-For: $ip" "GET /api/orders/verify?order=$i&email=test@test.com"
  done
done
# Expect: Global rate limit triggered, all requests blocked

# Test 4: Identifier normalization bypass
curl "GET /api/orders/verify?order=0001234&email=USER@TEST.COM"
curl "GET /api/orders/verify?order=1,234&email=user@test.com"
curl "GET /api/orders/verify?order=1234&email=user@test.com"
# Expect: All identical (normalized), count as same identifier
```

---

## Monitoring & Alerting

### Alerts to Create

```
- IP attempting >20 verifications/hour → Immediate block
- Sequential order enumeration detected → Lock endpoint
- Distributed attempt pattern detected → Increase monitoring
- Credential stuffing pattern detected → Review recent orders
- Timing variation detected in responses → Investigate
```

---

## Rollback Plan

If false positives block legitimate users:

1. Reduce rate limits by 50%
2. Increase delay thresholds
3. Add whitelist for known good IPs
4. Adjust pattern detection thresholds
5. Monitor and iterate
