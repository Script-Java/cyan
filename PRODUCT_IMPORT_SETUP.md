# Product Import Setup Guide

This guide covers everything needed to set up products and product imports with Supabase.

## 1. Database Schema Setup

### Apply the Migration

The database schema migration has been created at: `supabase/migrations/complete_admin_products_schema.sql`

**To apply it to your Supabase project:**

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor** 
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/complete_admin_products_schema.sql`
5. Paste it into the editor
6. Click **Run** button
7. Wait for the migration to complete (should see "Success" message)

#### Option B: Using Supabase CLI
```bash
# Connect to your project
supabase link --project-id nbzttuomtdtsfzcagfnh

# Apply all pending migrations
supabase db push
```

### Required Columns in admin_products Table

After applying the migration, your `admin_products` table should have:

| Column | Type | Purpose |
|--------|------|---------|
| id | BIGSERIAL | Primary key, auto-increment |
| name | VARCHAR | Product name |
| sku | VARCHAR | Stock keeping unit |
| base_price | NUMERIC(10,2) | Base product price |
| description | TEXT | Product description (HTML supported) |
| images | JSONB | Array of product images |
| options | JSONB | Product variations/options (colors, sizes, etc.) |
| shared_variants | JSONB | Shared variant configurations |
| customer_upload_config | JSONB | Configuration for customer file uploads |
| optional_fields | JSONB | Optional checkout fields |
| pricing_rules | JSONB | Dynamic pricing rules |
| categories | JSONB | Product categories |
| availability | BOOLEAN | Whether product is available |
| weight | NUMERIC | Product weight for shipping |
| text_area | TEXT | Additional text/notes |
| condition_logic | VARCHAR | Logic for applying rules |
| taxes | JSONB | Tax configurations |
| seo | JSONB | SEO metadata (title, description, URL) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## 2. Environment Variables Setup

### Required Environment Variables

Ensure these are set in your deployment environment (Fly.io):

```env
SUPABASE_URL=https://nbzttuomtdtsfzcagfnh.supabase.co
SUPABASE_SERVICE_KEY=<your-service-key>
JWT_SECRET=<your-jwt-secret>
```

### Verify Fly.io Secrets

To check/set environment variables on Fly.io:

```bash
# List all secrets
flyctl secrets list

# Set/update a secret
flyctl secrets set SUPABASE_URL=https://nbzttuomtdtsfzcagfnh.supabase.co
flyctl secrets set SUPABASE_SERVICE_KEY=<your-service-key>
flyctl secrets set JWT_SECRET=<your-jwt-secret>
```

## 3. API Endpoints

### Product Import Endpoint

**Endpoint:** `POST /api/admin/products/import`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "CREATE A STICKER",
  "basePrice": 0.0,
  "sku": "00004",
  "description": "<p>Product description HTML</p>",
  "images": [
    {
      "id": "main",
      "url": "https://example.com/image.png",
      "name": "Main Image"
    }
  ],
  "options": [
    {
      "id": "option-1",
      "name": "Size",
      "type": "dropdown",
      "required": false,
      "displayOrder": 1,
      "values": [
        {
          "id": "val-1",
          "name": "Small",
          "priceModifier": 0
        }
      ]
    }
  ],
  "categories": ["Stickers"],
  "availability": true,
  "customerUploadConfig": {
    "enabled": true,
    "maxFileSize": 50,
    "allowedFormats": ["png", "jpg", "gif"],
    "description": "Upload your artwork"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "CREATE A STICKER",
    "base_price": 0.0,
    "sku": "00004",
    "created_at": "2026-01-17T01:57:00Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Failed to create product",
  "details": "Column not found or type mismatch"
}
```

### Get All Products Endpoint

**Endpoint:** `GET /api/admin/products`

**Authentication:** Required (Bearer token, admin only)

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "CREATE A STICKER",
      "base_price": 0.0,
      "sku": "00004",
      "availability": true,
      "created_at": "2026-01-17T01:57:00Z"
    }
  ]
}
```

## 4. Frontend Components

### Import Product Button

Located in: `client/pages/AdminProducts.tsx`

- Button imports products using the `importAdminProduct()` function
- Displays loading state while importing
- Shows success/error toast notifications
- Automatically refreshes product list on success

### Admin Product Import Utility

Located in: `client/lib/import-product.ts`

- `importAdminProduct(productData)` - Makes API call to import products
- `STICKY_SLAP_STICKER_PRODUCT` - Pre-configured product template

## 5. Testing the Setup

### Test Locally

1. Start dev server: `pnpm run dev`
2. Go to Admin > Products page
3. Click "Import Product" button
4. Should see success message
5. Product appears in products list

### Test on Production (Fly.io)

1. Push code: Click "Push" in UI (top right)
2. Wait for Fly.io to rebuild and deploy
3. Visit https://51be3d6708344836a6f6586ec48b1e4b-476bca083d854b2a92cc8cfa4.fly.dev/admin/products
4. Login with admin credentials
5. Click "Import Product" button
6. Verify success message appears

## 6. Troubleshooting

### Error: "Could not find the 'categories' column"
- **Cause:** Migration hasn't been applied yet
- **Fix:** Apply the migration from step 1

### Error: "No authorization token provided"
- **Cause:** JWT_SECRET not set in environment
- **Fix:** Set `JWT_SECRET` in Fly.io secrets

### Error: "Failed to create product"
- **Cause:** Database connection issue or column mismatch
- **Fix:** 
  1. Verify SUPABASE_URL and SUPABASE_SERVICE_KEY are correct
  2. Check that all columns exist in database
  3. Review server logs: `flyctl logs`

### Products not appearing after import
- **Cause:** Availability filter or database query issue
- **Fix:** Check that `availability` is set to `true` in database

## 7. File Locations

| File | Purpose |
|------|---------|
| `supabase/migrations/complete_admin_products_schema.sql` | Database schema migration |
| `server/routes/admin-products.ts` | Backend API handlers |
| `server/index.ts` | Route definitions (import endpoint) |
| `client/pages/AdminProducts.tsx` | Admin products UI with import button |
| `client/lib/import-product.ts` | Frontend import utility |

## 8. Next Steps

1. ✅ Apply the migration to Supabase
2. ✅ Verify environment variables on Fly.io
3. ✅ Test import locally
4. ✅ Push code to production
5. ✅ Test import on production
6. ✅ Import your products catalog

---

**Questions or issues?** Check the browser console and server logs for detailed error messages.
