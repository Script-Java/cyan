# Deployment Checklist for Netlify

## Pre-Deployment Steps

### 1. Database Schema ✓
- [x] All migrations applied to Supabase
- [x] Admin products table exists with all required columns
- [x] Supabase project is accessible and configured

### 2. Environment Variables (Netlify)
- [x] `JWT_SECRET` - Set in Netlify Dashboard
- [x] `SUPABASE_URL` - Set in Netlify Dashboard  
- [x] `SUPABASE_SERVICE_KEY` - Set in Netlify Dashboard
- [x] `SQUARE_APPLICATION_ID` - Set in Netlify Dashboard
- [x] `SQUARE_ACCESS_TOKEN` - Set in Netlify Dashboard
- [x] `SQUARE_LOCATION_ID` - Set in Netlify Dashboard

### 3. Code Changes
- [x] CORS configuration updated for production domain (stickyslap.app)
- [x] All Fly.io references removed from code
- [x] Route ordering fixed in `server/index.ts`
- [x] Supabase utilities configured correctly

### 4. Local Testing
- [x] Dev server running: `pnpm run dev`
- [x] Signup flow works on localhost
- [x] Checkout flow works on localhost
- [x] Admin features accessible with proper auth
- [x] All API endpoints responding correctly

### 5. Push to Production
- [x] All code changes committed and pushed to git
- [x] Netlify deployment triggered automatically
- [x] Build completed successfully

### 6. Production Verification
- [x] Visit https://stickyslap.app
- [x] Signup/login works
- [x] Can create orders and checkout
- [x] Admin dashboard accessible

## Detailed Setup Steps

### Step 1: Set Netlify Environment Variables

1. Go to https://app.netlify.com
2. Select your site
3. Navigate to **Settings** → **Build & Deploy** → **Environment**
4. Click **Edit variables**
5. Add all required variables:

```
JWT_SECRET=cUCuGC4kLjHA5U63lrSMi1TawBzrFbaDqCQrDf4SXV0=
SUPABASE_URL=https://nbzttuomtdtsfzcagfnh.supabase.co
SUPABASE_SERVICE_KEY=<your-service-key>
SQUARE_APPLICATION_ID=sq0idp-Ax3q0SqLPOhtGcUnC6YsOg
SQUARE_ACCESS_TOKEN=<your-square-token>
SQUARE_LOCATION_ID=M22XGM76XXKXW
```

6. Click **Save**
7. Netlify will automatically redeploy with the new variables

### Step 2: Test Locally

```bash
# Start dev server
pnpm run dev

# In browser:
# 1. Navigate to http://localhost:5173
# 2. Try signup at http://localhost:5173/signup
# 3. Try checkout at http://localhost:5173/checkout-new
# 4. Access admin at http://localhost:5173/admin
```

### Step 3: Deploy to Production

1. Make all code changes locally
2. Push to git: `git push origin main`
3. Netlify automatically detects changes and deploys
4. Monitor deploy status at https://app.netlify.com

### Step 4: Verify Production

1. Visit https://stickyslap.app
2. Test signup flow
3. Test checkout flow
4. Login to admin dashboard
5. Verify all features work

## Troubleshooting

### Issue: CORS Policy Error
**Solution:** Ensure stickyslap.app is in CORS whitelist in `server/index.ts`
```typescript
const allowedOrigins = [
  "https://stickyslap.app",
  "https://www.stickyslap.app",
  // ... other origins
];
```

### Issue: JWT Token Verification Error
**Solution:** Check JWT_SECRET is set in Netlify environment variables
```bash
# In Netlify Dashboard:
# Settings → Build & Deploy → Environment
# Verify JWT_SECRET is set and matches your local value
```

### Issue: API Endpoints Not Found (404)
**Solution:** Check netlify.toml redirects are configured correctly
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api:splat"
  status = 200
```

### Issue: Payment Integration Not Working
**Solution:** Verify Square credentials in environment variables
```
SQUARE_APPLICATION_ID=sq0idp-...
SQUARE_ACCESS_TOKEN=EAAA...
SQUARE_LOCATION_ID=M22X...
```

## Post-Deployment Verification

### ✓ Check Netlify Deployment
1. Go to https://app.netlify.com
2. Select your site
3. Go to **Deploys** tab
4. Verify latest deploy shows "Published" status
5. Check build logs for errors

### ✓ Test Authentication
```bash
# Signup
curl -X POST https://stickyslap.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Should return token and customer data
```

### ✓ Test Checkout
1. Visit https://stickyslap.app/products
2. Add item to cart
3. Proceed to checkout
4. Fill in shipping address
5. Complete payment (test mode)

### ✓ Check Environment Variables
1. In Netlify Dashboard
2. Settings → Build & Deploy → Environment
3. Verify all required variables are set
4. Note: Secret variables won't display for security

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `server/index.ts` | Removed Fly.io references, added stickyslap.app CORS | ✓ Fixed |
| `server/routes/square.ts` | Removed Fly.io URL construction | ✓ Fixed |
| `netlify.toml` | Configured for Netlify deployment | ✓ Ready |
| `FLY_IO_ENV_VARS.md` | Marked as deprecated | ✓ Updated |
| `fly.toml` | No longer used | ℹ️ Legacy |

## Migration from Fly.io to Netlify

If migrating from Fly.io:

1. **Code Changes:**
   - Remove Fly.io environment variable references
   - Update CORS to include Netlify domain
   - Update URL construction for payment redirects

2. **Environment Variables:**
   - Set all variables in Netlify Dashboard (not flyctl)
   - Use same values as before for consistency

3. **DNS:**
   - Update domain DNS to point to Netlify
   - Or use Netlify's managed DNS

4. **SSL/TLS:**
   - Netlify automatically provides HTTPS
   - No additional configuration needed

## Support

For deployment issues:
1. Check Netlify build logs: https://app.netlify.com → Deploys
2. Verify environment variables are set correctly
3. Check browser console for client-side errors
4. Use curl to test API endpoints directly
5. Review server function logs in Netlify Dashboard
