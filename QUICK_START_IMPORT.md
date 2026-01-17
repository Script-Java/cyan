# Quick Start: Import CREATE A STICKER Product

## Status: Ready to Deploy ✅

The product import has been fixed and is ready to deploy to production.

## What Was Fixed

- ✅ Removed `categories` field from product template (causing database errors)
- ✅ Fixed route ordering for `/api/admin/products/import` endpoint
- ✅ Updated Supabase URL to correct instance
- ✅ Fixed authorization headers in AdminProofs

## Next Steps

### Step 1: Push Code to Production (5 minutes)
1. In Builder.io UI, click the **Push** button (top right)
2. Wait for Fly.io to rebuild and deploy
3. You'll see deployment confirmation

### Step 2: Test Product Import (2 minutes)
1. Visit your Fly.io production URL
2. Login as admin user
3. Go to **Products** page
4. Click **Import Product** button
5. Wait for success message
6. Verify product appears in the list

## What Gets Imported

**Product Name:** CREATE A STICKER  
**SKU:** 00004  
**Price:** Free (base product, customer pays for options)  
**Availability:** Active/Published  

**Images:** 6 gallery images from Ecwid
- Main image
- 5 gallery images

**Options:**
1. **VINYL FINISH** (dropdown)
   - Satin & Lamination
   - Gloss & Lamination

2. **STICKER SIZE PRICE PER STICKER** (dropdown) 
   - 2 x 1 ($0.22)
   - 2 x 3 ($0.23)
   - 2.5" x 6 ($0.42)
   - 3" x 3 ($0.31)
   - 4" x 4 ($0.33)
   - 5" x 5 ($0.39)
   - 7.5" x 3" ($1.02)
   - 6.5" x 2" ($0.95)

3. **BOARDER CUT** (dropdown)
   - Full bleed cut
   - White boarder cut

4. **ARTWORK** (file upload - required)
   - Accepts PNG, JPG, GIF, PDF, AI, PSD
   - Max 50MB file size

**Description:** Full HTML description with features and benefits

## Verify Import Success

### In Admin Products Page
- [ ] Product appears in products list
- [ ] Product name shows as "CREATE A STICKER"
- [ ] Product SKU shows as "00004"
- [ ] Product availability shows as "true"

### In Product Details
- [ ] Click on product to view details
- [ ] All 6 images visible in gallery
- [ ] All 4 options displayed
- [ ] Description shows properly

### On Public Product Page
1. Go to public store URL
2. Search for or navigate to product
3. [ ] Product page loads
4. [ ] Gallery shows all images
5. [ ] Options are selectable
6. [ ] Can add to cart with options selected

## Troubleshooting

### If Import Fails with Error
**Error:** "Could not find 'categories' column"
- **Status:** Should be fixed ✅
- **If still occurs:** Code hasn't been pushed to production yet. Click Push button.

**Error:** "No authorization token"
- **Status:** Should be fixed ✅
- **If still occurs:** Clear browser cache and login again

**Error:** "Failed to fetch"
- Check browser console for details
- Verify you're logged in as admin
- Check Fly.io logs: `flyctl logs`

### Product Doesn't Show After Import
1. Refresh the products page
2. Check browser developer console (F12) for errors
3. Verify product in Supabase dashboard
4. Confirm `availability` is set to `true`

## Database Migration (Optional - For Future)

Once deployed successfully, you can optionally apply this migration to add the categories column:

```sql
ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;
```

This enables organizing products by category in the admin interface.

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Push code | 2-5 min | ⏳ Waiting for you |
| Fly.io deploy | 2-3 min | Automatic |
| Test import | 2 min | Manual |
| **Total** | **6-10 min** | **On track** |

**Ready to go! Click Push to deploy.** 🚀
