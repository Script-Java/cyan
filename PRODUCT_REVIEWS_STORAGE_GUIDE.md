# Product Reviews Storage Guide

## Overview

Your product reviews are stored in **two different locations** for optimal performance and cost-efficiency:

### 1. **Review Data** → Stored in Supabase
### 2. **Review Photos** → Stored in Cloudinary

---

## Storage Details

### 📦 Review Data (Supabase)

**Table:** `product_reviews`  
**Location:** Supabase PostgreSQL Database  
**Database:** `nbzttuomtdtsfzcagfnh`

**What's stored:**
- Reviewer name and email
- Rating (1-5 stars)
- Review title and comment text
- Image URLs (links to photos in Cloudinary)
- Review status (pending/approved/rejected)
- Helpful count
- Created/updated timestamps

**Access:**
1. Go to https://app.supabase.com/
2. Select your project
3. Go to **Table Editor** in the left sidebar
4. Find and click `product_reviews` table
5. You can view, edit, or delete reviews here

**SQL Query Example:**
```sql
-- View all reviews for a product
SELECT * FROM product_reviews 
WHERE product_id = 'admin_11' 
ORDER BY created_at DESC;

-- View only approved reviews
SELECT * FROM product_reviews 
WHERE product_id = 'admin_11' 
AND status = 'approved'
ORDER BY created_at DESC;

-- Update review status to approved
UPDATE product_reviews 
SET status = 'approved' 
WHERE id = 1;
```

---

### 🖼️ Review Photos (Cloudinary)

**Storage Service:** Cloudinary Cloud Storage  
**Folder:** `sticky-slap/reviews/`  
**Max File Size:** 15MB per image

**What happens to photos:**
1. User uploads image from their device
2. Image is compressed/optimized by Sharp
3. Image is uploaded to Cloudinary
4. Cloudinary returns a secure URL
5. URL is stored in Supabase `product_reviews.image_urls` (JSONB array)

**Access your Cloudinary dashboard:**
1. Log in to https://cloudinary.com/console
2. Go to **Media Library**
3. Look in the `sticky-slap/reviews/` folder
4. All review photos are stored there

**Example Image URL:**
```
https://res.cloudinary.com/dabgothkm/image/upload/v1234567890/sticky-slap/reviews/abc123.jpg
```

---

## File Size Limits

### Updated Settings (Changed to 15MB)

| Item | Limit | Notes |
|------|-------|-------|
| **Max per image** | 15MB | Updated from 5MB |
| **Max images per review** | 3 | Hard limit |
| **Total per review** | 45MB | (3 images × 15MB) |
| **Cloudinary storage** | Unlimited* | Depends on your Cloudinary plan |

*Cloudinary free tier has limits; check your account at https://cloudinary.com/console/settings/billing

---

## How the Flow Works

### Review Submission Process

```
1. USER SUBMITS REVIEW
   ↓
2. Frontend validates:
   - Name, email, rating required
   - Images max 15MB each
   - Max 3 images per review
   ↓
3. Images are compressed using Sharp
   - Resized to 600x600px max
   - Quality: 80% JPEG
   ↓
4. Compressed images uploaded to Cloudinary
   - Folder: sticky-slap/reviews/
   - Returns: secure URL
   ↓
5. Review data + image URLs saved to Supabase
   - Table: product_reviews
   - Status: pending (requires admin approval)
   ↓
6. Admin approves review in dashboard
   - Status changes to: approved
   ↓
7. Review is now visible to all customers
```

---

## Managing Reviews

### View Reviews (Admin)

**In Supabase:**
1. Go to https://app.supabase.com/
2. Select your project
3. Click **Table Editor**
4. Click `product_reviews`
5. Filter by `status = 'pending'` to see reviews awaiting approval

### Approve/Reject Reviews (Admin)

**Option 1: Direct SQL Update**
```sql
-- Approve a review
UPDATE product_reviews 
SET status = 'approved' 
WHERE id = 123;

-- Reject a review
UPDATE product_reviews 
SET status = 'rejected' 
WHERE id = 123;
```

**Option 2: Using API (Future Admin Panel)**
```bash
# Approve review (requires admin token)
curl -X PATCH https://yourapp.com/api/admin/reviews/123/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

### Delete Reviews (Admin)

**In Supabase:**
1. Open the `product_reviews` table
2. Find the review
3. Click the trash icon to delete

**Note:** Deleting the review from Supabase will NOT automatically delete the images from Cloudinary. You must manually delete them from Cloudinary if needed.

---

## Deleting Images from Cloudinary

### Method 1: Manual Deletion (UI)
1. Go to https://cloudinary.com/console
2. Click **Media Library**
3. Navigate to `sticky-slap/reviews/`
4. Click on an image
5. Click the trash icon

### Method 2: Using API
```bash
curl -X POST \
  -u YOUR_API_KEY:YOUR_API_SECRET \
  https://api.cloudinary.com/v1_1/dabgothkm/resources/image/tags/sticky-slap%2Freviews
```

---

## Database Schema

### product_reviews Table Structure

```sql
Column              Type        Description
─────────────────────────────────────────────────────
id                  BIGSERIAL   Unique review ID
product_id          VARCHAR     The product being reviewed (e.g., "admin_11")
reviewer_name       VARCHAR     Customer's name
reviewer_email      VARCHAR     Customer's email
rating              INTEGER     1-5 stars
title               VARCHAR     Review headline
comment             TEXT        Review text
image_urls          JSONB       Array of Cloudinary image URLs
helpful_count       INTEGER     How many found this helpful
status              VARCHAR     pending/approved/rejected
created_at          TIMESTAMP   When review was submitted
updated_at          TIMESTAMP   Last modified date
```

---

## Costs & Storage

### Supabase Costs
- **Database storage:** ~1KB per review (minimal)
- **Bandwidth:** Included in free tier

### Cloudinary Costs
- **Free tier:** 25GB storage + 25GB bandwidth/month
- **Paid plans:** Start at $99/month for more storage

**Cost estimate for reviews:**
- 1000 reviews = ~1KB each = 1MB data = negligible cost
- 1000 reviews × 2 images = 2000 images
- If avg 1MB per image after compression = 2GB = still free tier for most

---

## Troubleshooting

### Images not appearing in reviews

1. Check Supabase table:
   ```sql
   SELECT id, reviewer_name, image_urls FROM product_reviews 
   WHERE status = 'approved' LIMIT 5;
   ```
   - If `image_urls` is empty or NULL, images failed to upload

2. Check Cloudinary Media Library:
   - Log in to https://cloudinary.com/console
   - Go to **Media Library** → `sticky-slap/reviews/`
   - Look for recently uploaded files

3. Check server logs:
   - Look for "Error uploading review image" in your server logs
   - This indicates Cloudinary upload failed

### Reviews not showing

1. Check review status:
   ```sql
   SELECT id, status FROM product_reviews 
   WHERE product_id = 'admin_11';
   ```
   - Status must be `'approved'` to display publicly

2. Check API endpoint:
   - GET `/api/reviews/admin_11` should return approved reviews
   - If 404, the table may not exist

---

## Security & RLS Policies

**Row Level Security (RLS) is enabled on product_reviews:**

- ✅ **Anyone can:** Read approved reviews
- ✅ **Anyone can:** Submit new reviews (pending moderation)
- 🔒 **Only admins can:** Approve, reject, or delete reviews
- 🔒 **Admin APIs:** Protected with JWT authentication

This ensures users can't see pending/rejected reviews or modify others' reviews.

---

## Next Steps

1. **Create the database table** (if not done yet):
   - Run the SQL from `PRODUCT_REVIEWS_MIGRATION.sql`

2. **Test a review submission:**
   - Go to a product page
   - Click "Write a Review"
   - Submit with a test photo
   - Check Supabase for the review

3. **Approve the review:**
   - In Supabase, find the review
   - Change status from `pending` to `approved`

4. **Verify it appears:**
   - Reload the product page
   - Review should now be visible!

---

## Questions?

For help with:
- **Supabase:** https://supabase.com/docs/
- **Cloudinary:** https://cloudinary.com/documentation
- **API Endpoints:** Check `/server/routes/reviews.ts`
