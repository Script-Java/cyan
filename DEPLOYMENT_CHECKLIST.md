# Deployment Checklist for Product Import

## Pre-Deployment Steps

### 1. Database Schema ✓
- [ ] Applied migration: `supabase/migrations/complete_admin_products_schema.sql`
- [ ] Verified all columns exist in `admin_products` table
- [ ] Command: Visit Supabase Dashboard > SQL Editor > Run migration

### 2. Environment Variables
- [ ] Set `SUPABASE_URL` to `https://nbzttuomtdtsfzcagfnh.supabase.co`
- [ ] Set `SUPABASE_SERVICE_KEY` (find in Supabase Dashboard > Settings > API)
- [ ] Set `JWT_SECRET` to a secure random string
- [ ] Command: `flyctl secrets list` to verify on Fly.io

### 3. Code Changes
- [ ] ✓ Fixed route ordering in `server/index.ts` (import route before parameterized)
- [ ] ✓ Updated `server/utils/supabase.ts` with correct URL
- [ ] ✓ Fixed `handleImportAdminProduct` to handle missing columns gracefully
- [ ] ✓ Fixed AdminProofs authorization headers
- [ ] ✓ Removed duplicate React imports from AdminProducts.tsx

### 4. Local Testing
- [ ] Dev server running: `pnpm run dev`
- [ ] Admin products page loads without errors
- [ ] Import Product button is visible and clickable
- [ ] Can successfully import a product
- [ ] Product appears in products list

### 5. Push to Production
- [ ] All code changes committed and ready
- [ ] Click "Push" button in Builder.io UI
- [ ] Wait for Fly.io deployment to complete

### 6. Production Verification
- [ ] Visit production URL (fly.dev domain)
- [ ] Login as admin
- [ ] Navigate to Products page
- [ ] Test import functionality
- [ ] Verify product appears in database

## Detailed Setup Steps

### Step 1: Apply Database Migration

1. Go to https://app.supabase.com
2. Select your project: `nbzttuomtdtsfzcagfnh`
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy entire contents of `supabase/migrations/complete_admin_products_schema.sql`
6. Paste into editor
7. Click **Run**
8. Verify "Success" message appears
9. Go to **Table Editor** > `admin_products` to verify columns

### Step 2: Set Fly.io Environment Variables

```bash
# Get your Supabase Service Key:
# 1. Go to https://app.supabase.com
# 2. Select project
# 3. Settings > API
# 4. Copy "service_role key"

# Set the secrets
flyctl secrets set SUPABASE_URL=https://nbzttuomtdtsfzcagfnh.supabase.co
flyctl secrets set SUPABASE_SERVICE_KEY="<paste-service-key-here>"
flyctl secrets set JWT_SECRET="<generate-random-secret>"

# Generate a random JWT_SECRET (run this locally):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Verify they were set
flyctl secrets list
```

### Step 3: Test Locally

```bash
# Terminal 1: Start dev server
pnpm run dev

# Terminal 2: Check logs
npm run dev > logs.txt 2>&1

# In browser:
# 1. Navigate to http://localhost:5173/admin/products
# 2. Login with admin account
# 3. Click "Import Product" button
# 4. Should see success toast notification
# 5. Product should appear in list
```

### Step 4: Deploy to Production

1. Ensure all local changes are working
2. In Builder.io UI, click "Push" button (top right)
3. Wait for deployment to complete
4. Visit production URL from Fly.io
5. Test product import again

## Troubleshooting

### Issue: "Could not find 'categories' column"
**Solution:** Migration not applied
```bash
# Apply migration via Supabase dashboard (Step 1 above)
```

### Issue: "No authorization token provided"
**Solution:** JWT_SECRET not set
```bash
# Set on Fly.io
flyctl secrets set JWT_SECRET="<random-secret>"
```

### Issue: "Failed to create product"
**Solution:** Check server logs
```bash
# View live logs
flyctl logs

# Or check local dev console for details
```

### Issue: Products not showing after import
**Solution:** Availability filter
```sql
-- Check in Supabase SQL Editor:
SELECT id, name, availability FROM admin_products;

-- If availability is false, update it:
UPDATE admin_products SET availability = true WHERE id = <product_id>;
```

## Post-Deployment Verification

### ✓ Check Database
```sql
-- Run in Supabase SQL Editor
SELECT 
  id, 
  name, 
  base_price, 
  sku, 
  availability,
  created_at 
FROM admin_products 
ORDER BY created_at DESC;
```

### ✓ Check Environment Variables
```bash
# On Fly.io
flyctl secrets list

# Should show:
# JWT_SECRET
# SUPABASE_SERVICE_KEY
# SUPABASE_URL
```

### ✓ Check Server Logs
```bash
flyctl logs -a <app-name>

# Look for:
# ✅ "Express server initialized"
# ✅ "CORS Configuration initialized"
# ✓ No 401/403 errors
# ✓ No "Could not find column" errors
```

### ✓ Test API Endpoint Directly
```bash
# Get auth token first (login to get it)
TOKEN="<your-auth-token>"

# Test import endpoint
curl -X POST https://<your-fly-app>.fly.dev/api/admin/products/import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "basePrice": 10.00,
    "sku": "TEST001",
    "description": "Test",
    "images": [],
    "options": [],
    "availability": true
  }'

# Should return:
# {
#   "success": true,
#   "product": { "id": ..., "name": "Test Product", ... }
# }
```

## Files Modified

| File | Changes | Status |
|------|---------|--------|
| `supabase/migrations/complete_admin_products_schema.sql` | New migration file | ✓ Created |
| `server/index.ts` | Fixed route ordering | ✓ Fixed |
| `server/routes/admin-products.ts` | Fixed import handler | ✓ Fixed |
| `server/utils/supabase.ts` | Updated Supabase URL | ✓ Fixed |
| `client/pages/AdminProducts.tsx` | Fixed duplicate imports | ✓ Fixed |
| `client/pages/AdminProofs.tsx` | Added auth headers | ✓ Fixed |
| `client/lib/import-product.ts` | New utility file | ✓ Created |

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs: `flyctl logs`
3. Verify database schema in Supabase dashboard
4. Check environment variables: `flyctl secrets list`
5. Test with curl commands from "Check API Endpoint" section
