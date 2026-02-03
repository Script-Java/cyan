# Security & Secret Management Guide

## Critical Alert: .env File Currently in Git

The `.env` file is currently tracked in git due to the previous `!.env` unignore rule in `.gitignore`. This has been fixed, but you must:

1. **Immediately rotate all secrets** (assume they are compromised)
2. **Remove .env from git history** using one of these methods:

### Option 1: Remove from Latest Commit Only

If the .env file was only in the latest commit:

```bash
git rm --cached .env
git commit --amend
git push --force-with-lease
```

### Option 2: Remove from Entire History (BFG Repo-Cleaner)

If .env has been committed multiple times:

```bash
# Install BFG: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env

# Clean git references
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push to update remote
git push --force-with-lease
```

### Option 3: Using git filter-branch

```bash
git filter-branch --tree-filter 'rm -f .env' --prune-empty -f HEAD

# Force push
git push --force-with-lease
```

---

## Environment Configuration

### Setup Instructions

1. **Copy the template file:**

   ```bash
   cp .env.example .env
   ```

2. **Fill in real values for all secrets:**
   - Supabase credentials
   - JWT secret
   - Payment provider keys
   - Email service API key
   - Third-party integrations

3. **Never commit .env** - it's ignored by .gitignore

4. **Use .env.example for documentation** - this file should be committed with placeholder values

### Environment Variables by Service

#### Supabase (Database & Auth)

**Server-side (NEVER expose to client):**

```
SUPABASE_URL              PostgreSQL database URL (internal use)
SUPABASE_SERVICE_KEY      Admin service key - CRITICALLY SENSITIVE
```

**Client-side (safe to expose - constrained by RLS):**

```
VITE_SUPABASE_URL         PostgreSQL database URL (public)
VITE_SUPABASE_ANON_KEY    Public JWT token - safe because RLS enforces access
```

**Important Security Note:**

- The `VITE_SUPABASE_ANON_KEY` is **intentionally public** and can be safely included in client-side code
- All data access is protected by Row Level Security (RLS) policies at the database level
- The anon key cannot bypass RLS - it can only access data that RLS policies explicitly allow
- The `SUPABASE_SERVICE_KEY` is for server-side operations only and must NEVER be exposed

- **Access Location:** https://app.supabase.com/projects
- **Risk Level:**
  - SERVICE_KEY: CRITICAL - Controls all database access without RLS restrictions
  - ANON_KEY: LOW - Public-facing, constrained by RLS policies

#### Authentication & Security

```
JWT_SECRET               Secret for signing authentication tokens
```

- **Generate with:** `openssl rand -base64 32`
- **Risk Level:** CRITICAL - All auth depends on this

#### Square Payment Processing

```
SQUARE_APPLICATION_ID     Application identifier
SQUARE_ACCESS_TOKEN       API access token (SENSITIVE)
SQUARE_WEBHOOK_SIGNATURE_KEY  Webhook verification key
SQUARE_LOCATION_ID        Your Square location
```

- **Access Location:** https://developer.squareup.com/apps
- **Risk Level:** HIGH - Payment processing access

#### Resend Email Service

```
RESEND_API_KEY           Email delivery API key (SENSITIVE)
```

- **Access Location:** https://resend.com/api-keys
- **Risk Level:** HIGH - Can send emails on your behalf

#### Ecwid eCommerce Platform

```
ECWID_STORE_ID           Store identifier
ECWID_API_TOKEN          API authentication token (SENSITIVE)
```

- **Risk Level:** MEDIUM - Ecommerce data access

---

## Secret Rotation Procedures

### 🚨 When to Rotate Secrets

- [ ] Immediately when .env is accidentally committed to git
- [ ] Quarterly as part of security maintenance
- [ ] After employee/contractor departure
- [ ] If a breach is suspected
- [ ] After major security updates

### Step 1: Supabase Service Keys

**Why:** Controls all database access, user authentication, and data retrieval

**Rotation Steps:**

1. Go to https://app.supabase.com/projects/[project-id]/settings/api
2. Click "Rotate" next to Service Key
3. Copy new key to your secure secret manager
4. Update `SUPABASE_SERVICE_KEY` in deployment environment
5. Restart all running servers/functions
6. Verify server logs show successful connection
7. Delete old key from any notes/documents

**Impact:** Server must restart to use new key

---

### Step 2: JWT Secret

**Why:** All authentication tokens depend on this secret

**Rotation Steps:**

1. Generate new secret: `openssl rand -base64 32`
2. Update `JWT_SECRET` in deployment environment
3. **Option A - Immediate rotation (logs out all users):**
   - Restart servers
   - All old tokens become invalid
4. **Option B - Gradual rotation (no disruption):**
   - Add new secret to `JWT_SECRET_NEW`
   - Update code to accept both old and new secrets for verification
   - Reissue tokens with new secret on next login
   - Monitor old token usage
   - Remove old secret after tokens expire (typically 7-30 days)

**Impact:** Users may need to re-login depending on rotation strategy

---

### Step 3: Square Payment Keys

**Why:** Processes all payments and can refund transactions

**Rotation Steps:**

1. Go to https://developer.squareup.com/apps
2. Click your application
3. Go to "Credentials" tab
4. Generate new Access Token
5. Copy new token to secret manager
6. Update `SQUARE_ACCESS_TOKEN` in deployment environment
7. Update `SQUARE_WEBHOOK_SIGNATURE_KEY` (if changed)
8. Restart payment processing servers
9. Verify webhook delivery in Square dashboard
10. Revoke old access token

**Impact:** Payments will fail until servers are restarted with new keys

---

### Step 4: Resend Email API Key

**Why:** Sends invoices, notifications, and password reset emails

**Rotation Steps:**

1. Go to https://resend.com/api-keys
2. Click your current API key
3. Click "Delete" or "Regenerate"
4. Copy new key to secret manager
5. Update `RESEND_API_KEY` in deployment environment
6. Restart email services
7. Send test email to verify
8. Delete old key

**Impact:** Email delivery will fail until servers restart

---

### Step 5: Ecwid API Token

**Why:** Syncs ecommerce data from Ecwid platform

**Rotation Steps:**

1. Log into Ecwid store dashboard
2. Go to Settings → Integrations & Apps → API
3. Generate new API token
4. Update `ECWID_API_TOKEN` in deployment environment
5. Restart ecommerce sync services
6. Verify data sync completes successfully
7. Revoke old token

**Impact:** Ecommerce data sync will be interrupted until servers restart

---

## Best Practices

### Development Environment

- Use unique secrets for dev vs production
- Rotate dev secrets less frequently (quarterly)
- Never reuse production secrets for development
- Document secrets in 1password/LastPass/Vault, not in code

### Production Environment

- Use a secrets management service:
  - AWS Secrets Manager
  - HashiCorp Vault
  - 1Password
  - LastPass Enterprise
  - Vercel Environment Variables (for deployments)
- Implement rotation automation where possible
- Audit access logs weekly
- Never commit secrets to version control
- Use different keys for different environments

### Code Security

- ✅ Load secrets from environment variables only
- ✅ Check that all `process.env.SECRET_KEY` are in .env.example
- ✅ Use SUPABASE_SERVICE_KEY only on server-side code
- ✅ Use SUPABASE_ANON_KEY on client-side for RLS
- ❌ Don't hardcode secrets
- ❌ Don't log secrets in error messages
- ❌ Don't include secrets in error stack traces

---

## Verification Checklist

After completing secret setup and rotation:

- [ ] .env file is not tracked in git (check: `git ls-files | grep .env`)
- [ ] .env.example exists with placeholder values
- [ ] All environment variables in code are documented in .env.example
- [ ] Production deployment uses unique secrets (not copies of dev)
- [ ] All servers restarted after secret updates
- [ ] Old secrets revoked/deleted from provider dashboards
- [ ] Audit logs show successful authentication with new secrets
- [ ] Email delivery working (Resend)
- [ ] Payments processing working (Square)
- [ ] Database queries successful (Supabase)
- [ ] Ecommerce sync working (Ecwid)

---

## Emergency: Suspected Breach

If you suspect any secret has been compromised:

1. **Immediately rotate** all secrets (especially JWT_SECRET and service keys)
2. **Audit access logs** for unusual activity
3. **Review git history** for any committed secrets
4. **Notify stakeholders** of potential exposure
5. **Monitor for unauthorized transactions** in payment systems
6. **Force re-authentication** for all users
7. **Document the incident** for compliance records

---

## Compliance & Security Standards

This approach aligns with:

- **OWASP Top 10:** A02:2021 – Cryptographic Failures
- **CWE-798:** Use of Hard-Coded Credentials
- **PCI-DSS 3.2.1:** Prevent unauthorized access to secrets
- **SOC 2 Type II:** Secure handling of customer data
- **GDPR:** Data protection and breach notification requirements
