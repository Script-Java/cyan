# Shared Variants Feature Setup Guide

## Overview

The Shared Variants feature allows you to create reusable variant groups that can be applied across multiple products. This is useful when you have common option combinations that repeat across your product catalog.

## Database Setup

### Migration

A migration file has been created to add the `shared_variants` column to the `admin_products` table:

- **File**: `supabase/migrations/add_shared_variants_to_products.sql`

To apply this migration using Supabase CLI:

```bash
supabase migration up
```

Or manually run the SQL in your Supabase dashboard:

```sql
ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS shared_variants JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_admin_products_shared_variants ON admin_products USING gin(shared_variants);
```

## Code Changes

### Frontend (client/pages/ProductForm.tsx)

1. **New Interface**: `SharedVariant` - Represents a shared variant group
2. **New State**: `sharedVariants` array in `ProductFormData`
3. **New Handlers**:
   - `addSharedVariant()` - Create a new shared variant group
   - `updateSharedVariant()` - Update shared variant properties
   - `removeSharedVariant()` - Delete a shared variant group
   - `toggleSharedVariantOption()` - Toggle which options are included in a variant group

4. **New UI Section**: "Shared Variants" section between "Product Options & Variants" and "Customer Design Upload" sections

### Backend (server/routes/admin-products.ts)

1. **New Interface**: `SharedVariant` - Type definition for shared variants
2. **Updated ProductFormData**: Includes `sharedVariants` array
3. **Updated Handlers**: Both `handleCreateProduct` and `handleUpdateProduct` now include `shared_variants` in the database mapping

## Using Shared Variants

### Creating a Shared Variant Group

1. Navigate to the Product Form (Create New Product or Edit Product)
2. Scroll to the **Shared Variants** section
3. Click **"Add Shared Variant"**
4. Fill in the following fields:
   - **Shared Variant Name**: A descriptive name (e.g., "Size & Color Combo")
   - **Description**: Explain what this variant group includes
   - **Select Options to Include**: Check the options that belong to this shared variant group

### Example Use Case

If you have products that all use the same combination of "Size" and "Color" options:

1. Create an option called "Size" with values: Small, Medium, Large
2. Create an option called "Color" with values: Red, Blue, Green
3. Create a shared variant group named "Standard Size & Color"
4. Select both "Size" and "Color" options
5. Apply this shared variant group to multiple products

## Data Structure

### Shared Variant JSON Format

```typescript
interface SharedVariant {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // Detailed description
  optionIds: string[]; // Array of option IDs included in this group
}
```

### Database Storage

The `shared_variants` column in `admin_products` table stores an array of `SharedVariant` objects as JSONB.

Example:

```json
[
  {
    "id": "abc123",
    "name": "Size & Color",
    "description": "Standard size and color options",
    "optionIds": ["opt1", "opt2"]
  },
  {
    "id": "def456",
    "name": "Material & Finish",
    "description": "Material and finish combination",
    "optionIds": ["opt3", "opt4"]
  }
]
```

## API Endpoints

### Create Product (with Shared Variants)

```
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Product Name",
  "basePrice": 99.99,
  "options": [...],
  "sharedVariants": [
    {
      "id": "abc123",
      "name": "Size & Color",
      "description": "...",
      "optionIds": ["opt1", "opt2"]
    }
  ],
  ...
}
```

### Update Product (with Shared Variants)

```
PUT /api/products/:productId
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Product Name",
  "basePrice": 99.99,
  "options": [...],
  "sharedVariants": [...],
  ...
}
```

## Testing

1. Create a new product with the Product Form
2. Add some options with values
3. Create one or more shared variant groups
4. Assign options to the shared variant groups
5. Save the product
6. Edit the product and verify shared variants are loaded correctly
7. Check the database to confirm `shared_variants` column contains the correct data

## Next Steps (Optional Enhancements)

- Add ability to apply shared variants to multiple products at once
- Create a "Manage Shared Variants" section in admin panel for organization-wide variant templates
- Add UI to preview which products use each shared variant
- Add validation to prevent orphaned shared variants when options are deleted
