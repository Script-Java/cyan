# Admin Reviews Feature

## Overview

A complete review moderation system has been added to your admin dashboard, allowing you to manage customer product reviews with ease.

---

## Quick Access

### Location in Admin Dashboard
1. Go to your Admin Dashboard (`/admin`)
2. In the **Quick Access** section, you'll see a new **"Reviews"** button with a star icon (yellow background)
3. Click it to go to the Reviews Management page

### Direct URL
```
/admin/reviews
```

---

## Features

### 📊 Review Statistics Dashboard
View at a glance:
- **Total Reviews** - All reviews submitted by customers
- **Pending** - Reviews awaiting approval (yellow badge)
- **Approved** - Published reviews visible to customers (green badge)
- **Rejected** - Rejected reviews not visible publicly (red badge)

### 🔍 Review Filtering
Filter reviews by status:
- **All** - View all reviews regardless of status
- **Pending** - Reviews awaiting your moderation (main focus)
- **Approved** - Already published reviews
- **Rejected** - Reviews you've rejected

### ✅ Moderation Actions

#### For Pending Reviews:
- **Approve** - Make review visible to customers
- **Reject** - Hide review from public (customer sees it's been rejected)
- **Delete** - Remove review completely from the system

#### For All Reviews:
- **Delete** - Remove any review at any time

### 📸 Review Details
Click any review to expand and see:
- Full review text
- Reviewer name and email
- Star rating (1-5)
- Product ID being reviewed
- All uploaded images (click to view full size)
- Submission date

### 🖼️ Image Handling
- View review photos inline in the moderation interface
- Click any image to open it full-size in a new tab
- Images up to 15MB each
- Up to 3 images per review

---

## Workflow

### Typical Moderation Workflow

```
1. Customer submits review with photos
   ↓
2. Review appears in PENDING tab
   ↓
3. Admin (You) reviews the content
   ↓
4. Choose one:
   - APPROVE → Review visible to customers
   - REJECT → Review hidden from public
   - DELETE → Review removed from system
   ↓
5. Review moves to appropriate tab
```

---

## File Structure

### New Files Created
```
client/pages/AdminReviews.tsx
  └─ Main admin reviews page component
  
ADMIN_REVIEWS_FEATURE.md (this file)
  └─ Feature documentation
```

### Modified Files
```
client/pages/AdminDashboard.tsx
  └─ Added Reviews quick access button
  
client/App.tsx
  └─ Added /admin/reviews route
  └─ Imported AdminReviews component
```

### Backend (Already Exists)
```
server/routes/reviews.ts
  ├─ handleGetAdminReviews() - Fetch all reviews
  ├─ handleUpdateReviewStatus() - Approve/reject reviews
  └─ handleDeleteReview() - Delete reviews

API Endpoints:
  GET    /api/admin/reviews (requires admin auth)
  PATCH  /api/admin/reviews/:reviewId/status (requires admin auth)
  DELETE /api/admin/reviews/:reviewId (requires admin auth)
```

---

## Database Table

All review data is stored in Supabase:

**Table:** `product_reviews`

**Columns:**
```
id              → Unique review ID
product_id      → Product being reviewed (e.g., "admin_11")
reviewer_name   → Customer's name
reviewer_email  → Customer's email
rating          → 1-5 star rating
title           → Review headline
comment         → Review text body
image_urls      → Array of Cloudinary image URLs
helpful_count   → How many found it helpful
status          → 'pending' | 'approved' | 'rejected'
created_at      → When submitted
updated_at      → Last modified
```

**Access:**
1. https://app.supabase.com/
2. Select your project
3. Table Editor → `product_reviews`

---

## Permissions & Security

### Authentication Required
- Must be logged in as admin
- Requires valid JWT token
- All requests validated on backend

### Row Level Security (RLS)
- ✅ Customers can see approved reviews only
- ✅ Customers can submit reviews (all statuses)
- 🔒 Only admins can modify reviews
- 🔒 Only admins can approve/reject reviews

---

## Usage Examples

### Approve a Review
1. Navigate to `/admin/reviews`
2. Click on a pending review
3. Review details expand
4. Click **"Approve"** button
5. Review is now visible to customers

### Reject a Review
1. Click on a pending review
2. Review details expand
3. Click **"Reject"** button
4. Review moves to Rejected tab
5. Review is hidden from customers

### Delete a Review
1. Click on any review
2. Review details expand
3. Click **"Delete Review"** (at bottom)
4. Confirm deletion
5. Review is completely removed

---

## Tips & Best Practices

### ✅ Do's
- Review pending submissions regularly
- Approve genuine customer feedback
- Reject spam or inappropriate reviews
- Keep an eye on review photos for product quality insights
- Use email addresses to identify repeat reviewers

### ❌ Don'ts
- Don't approve fake/spam reviews
- Don't delete legitimate negative reviews
- Don't use customer emails for marketing (privacy)
- Don't modify review content (approve/reject as-is)

---

## Troubleshooting

### Reviews Not Showing
1. Check Supabase table exists: https://app.supabase.com/
2. Verify you're logged in as admin
3. Try refreshing the page

### Images Not Displaying
1. Check Supabase `image_urls` field is populated
2. Check Cloudinary account at https://cloudinary.com/console
3. Verify review status is "approved" or review is being edited

### Can't Approve Reviews
1. Ensure you're logged in as admin
2. Check browser console for error messages
3. Try refreshing the page
4. Verify JWT token hasn't expired

### "Failed to fetch reviews"
1. Check server is running
2. Verify `/api/admin/reviews` endpoint exists
3. Check authentication token is valid
4. Try logging in again

---

## Keyboard Shortcuts
(Future enhancement - can be added)

Currently none, but could add:
- `Shift+A` - Approve review
- `Shift+R` - Reject review
- `Shift+D` - Delete review

---

## API Documentation

### Get All Reviews
```bash
GET /api/admin/reviews
Authorization: Bearer {ADMIN_TOKEN}

Response:
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "product_id": "admin_11",
      "reviewer_name": "John Doe",
      "reviewer_email": "john@example.com",
      "rating": 5,
      "title": "Great stickers!",
      "comment": "These stickers are amazing quality...",
      "image_urls": ["https://res.cloudinary.com/..."],
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Update Review Status
```bash
PATCH /api/admin/reviews/:reviewId/status
Authorization: Bearer {ADMIN_TOKEN}
Content-Type: application/json

Body:
{
  "status": "approved" | "rejected" | "pending"
}

Response:
{
  "success": true,
  "review": { ... }
}
```

### Delete Review
```bash
DELETE /api/admin/reviews/:reviewId
Authorization: Bearer {ADMIN_TOKEN}

Response:
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## Support

For issues with:
- **Reviews feature**: Check this documentation
- **Database**: See `PRODUCT_REVIEWS_STORAGE_GUIDE.md`
- **File uploads**: Check upload limits in `ProductReviews.tsx`
- **Server issues**: Check server logs for `/api/admin/reviews`

---

## Version History

**v1.0.0** (Current)
- Initial release
- Review moderation interface
- Image preview functionality
- Status filtering
- Delete capability
- Statistics dashboard

---

## Next Steps

1. ✅ Create `product_reviews` table (see `PRODUCT_REVIEWS_MIGRATION.sql`)
2. ✅ Test review submission on product page
3. ✅ Test admin approval workflow
4. ✅ Review published reviews on product page
5. (Optional) Add review email notifications
6. (Optional) Add bulk moderation actions
