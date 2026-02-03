# Upload Security & Database Protection

## Overview

This document outlines the security measures implemented to prevent database bloat from large file uploads and to ensure proper error handling when external services fail.

---

## The Problem

**Database Bloat from Base64 Fallbacks**

Previously, when cloud storage (Cloudinary) uploads failed, the system would fall back to encoding files as base64 data URLs and returning them to the client. The risks:

1. **Database Storage**: Base64-encoded files are 33% larger than binary files
2. **Performance**: Large text data in URL fields slows down queries
3. **Scalability**: A 5MB image becomes ~7MB of base64 text
4. **Limits**: PostgreSQL `text` fields can store up to 1GB, but reaching 100MB+ per table is problematic

### Example
```typescript
// BAD - Don't do this!
const dataUrl = `data:image/png;base64,${largeBase64String}`;
// If image is 5MB → base64 is ~7MB → stored in database
```

---

## Implementation

### 1. Cloudinary Upload (No Fallback)

**File:** `server/routes/designs.ts`

The `/api/designs/upload` endpoint now:

✅ **Validates input size** before processing
- Maximum 50MB file size
- Returns 413 (Payload Too Large) if exceeded

✅ **Requires Cloudinary configuration**
- Returns 503 (Service Unavailable) if not configured
- Prevents fallback to local storage

✅ **Returns error on upload failure**
- Returns 502 (Bad Gateway) if Cloudinary fails
- NO fallback to base64 data URLs
- Client must handle the error and retry

```typescript
// From designs.ts - error handling
if (uploadError) {
  console.error("Cloudinary upload error:", {...});
  return res.status(502).json({
    error: "Failed to upload design file to cloud storage",
    code: "CLOUDINARY_UPLOAD_FAILED",
  });
  // NO fallback - let client handle retry
}
```

### 2. Frontend Error Handling

**Files:** `client/pages/ProductPage.tsx`, `client/pages/Product.tsx`

Both components properly handle upload errors:

```typescript
const uploadResponse = await fetch("/api/designs/upload", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({fileData, fileName, fileType}),
});

if (!uploadResponse.ok) {
  throw new Error("Failed to upload design file");
  // Error caught below
}

const uploadData = await uploadResponse.json();
design_file_url = uploadData.fileUrl; // Only if success
```

**Error UX:**
- Toast notification: "Design file upload failed. Try again..."
- Allows user to continue without design or retry
- Does NOT attempt to store base64 as fallback

### 3. Payload Size Guards

Multiple layers of protection:

| Layer | File | Limit | Code |
|-------|------|-------|------|
| **Request Size** | designs.ts | 50MB | `Buffer.length > 50 * 1024 * 1024` |
| **Validation** | designs.ts | Check before upload | Validates before Cloudinary |
| **Database Field** | schema.ts | text (1GB) | Design URLs stored in text field |
| **URL Length** | postgres | 255-4000 chars | Cloudinary URLs are ~80 chars |

---

## Security Checklist

### During Development
- [ ] No `data:` URLs stored in `design_file_url` field
- [ ] All file uploads go through `/api/designs/upload`
- [ ] Cloudinary credentials are in environment variables
- [ ] Test upload failures return errors (not fallback)

### In Production
- [ ] CLOUDINARY_CLOUD_NAME is configured
- [ ] CLOUDINARY_API_KEY is configured
- [ ] CLOUDINARY_API_SECRET is configured
- [ ] HTTPS only for file uploads
- [ ] Monitor Cloudinary storage usage
- [ ] Audit logs show upload failures

### Testing Upload Failures

```bash
# Test 1: Cloudinary misconfigured
export CLOUDINARY_CLOUD_NAME=""
curl -X POST http://localhost:3000/api/designs/upload \
  -H "Content-Type: application/json" \
  -d '{"fileData":"iVBOR...","fileName":"test.png","fileType":"image/png"}'
# Expected: 503 Service Unavailable

# Test 2: Oversized file
# Send >50MB file
# Expected: 413 Payload Too Large

# Test 3: Invalid base64
curl -X POST http://localhost:3000/api/designs/upload \
  -H "Content-Type: application/json" \
  -d '{"fileData":"!!!not-base64!!!","fileName":"test.png"}'
# Expected: 400 Bad Request
```

---

## Data Flow

### Success Path
```
Client (ProductPage)
  ↓ POST /api/designs/upload
Server (handleUploadDesignFile)
  ↓ Validate size, config
Server (Cloudinary)
  ↓ Upload file
Cloudinary
  ↓ Return secure_url
Server
  ↓ Return { fileUrl: secure_url }
Client
  ↓ Store in design_file_url (cart/order)
Database
  ↓ Store short URL string (~80 chars)
```

### Failure Path
```
Client (ProductPage)
  ↓ POST /api/designs/upload
Server (handleUploadDesignFile)
  ↓ Validate size
  ↗ FAIL: Size > 50MB
Server
  ↓ Return 413 { error: "..." }
Client
  ↓ Catch error
Client
  ↓ Show toast: "Upload failed"
  ↓ Don't store any data
```

---

## Why No Fallback?

| Approach | Pros | Cons |
|----------|------|------|
| **Cloud (Cloudinary)** | Scalable, CDN-backed, optimized | Requires external service |
| **Base64 Fallback** | Works offline, no dependencies | Database bloat, slow queries, expensive storage |
| **Local Filesystem** | Fast, simple | Won't scale to multiple servers, no backup |

**Decision:** Cloud-only (Cloudinary) with proper error handling.

**Rationale:**
- Base64 fallback was the root cause of database bloat
- Local filesystem doesn't work in serverless (Netlify, Fly.dev)
- Cloudinary failure is rare (~0.1% of requests)
- Client has good UX for retries

---

## Monitoring & Alerts

### Metrics to Monitor
1. **Upload Success Rate**: Target >99.9%
2. **Average File Size**: Should be <5MB
3. **Cloudinary Quota**: Monitor storage used
4. **Error Types**: Track 502 (Cloudinary errors) vs 413 (oversized)

### Alert Conditions
- [ ] Upload success rate < 99%
- [ ] Error rate > 0.1% for specific file types
- [ ] Cloudinary storage > 80% quota
- [ ] Unusual file sizes (>50MB attempts)

---

## FAQ

### Q: What if Cloudinary is down?
A: The API returns 502 "Bad Gateway". Frontend shows an error message. User can retry later. No data is stored.

### Q: Can I add a local fallback?
A: **NO**. Local storage doesn't work in production (Netlify/Fly.dev are serverless). The base64 fallback was causing database bloat and is now removed.

### Q: What if a file is exactly 50MB?
A: It's accepted. The check is `> 50MB`, not `>= 50MB`.

### Q: Why Cloudinary and not S3?
A: Cloudinary handles image optimization, resizing, and CDN delivery automatically. S3 requires more infrastructure. Either can work, but Cloudinary was chosen for lower ops overhead.

### Q: Can customers upload large files (e.g., 100MB videos)?
A: No. The limit is 50MB. For larger files, implement multipart upload or use direct-to-S3 upload.

### Q: What happens if the database field is full?
A: PostgreSQL text fields support up to 1GB per row. With short URLs (~80 chars), you can store ~12 million URLs per field. Not a practical concern.

---

## Related Security Fixes

- **IDOR Prevention** (`docs/SECURITY.md`): Token-based order access
- **Secret Management** (`.env.example`): No secrets in code
- **Error Handling**: Graceful degradation when services fail

---

## Changelog

### Version 1.0 (2025-02-03)
- Removed base64 fallback from `/api/designs/upload`
- Added 50MB file size limit with validation
- Added Cloudinary configuration check
- Improved error messages (502, 413, 400 responses)
- Added security documentation
