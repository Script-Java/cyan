# Supabase Migration Instructions - admin_products Schema

## Overview
To enable all product fields to work correctly (weight, seo, categories, condition_logic, taxes, etc.), you need to apply a database migration to your Supabase `admin_products` table.

## Steps to Apply Migration

### 1. Go to Supabase Dashboard
- Visit https://app.supabase.com
- Select your project: **nbzttuomtdtsfzcagfnh**

### 2. Open SQL Editor
- Click on the **SQL Editor** in the left sidebar
- Click **+ New Query** to create a new SQL query

### 3. Copy and Paste the Migration

Copy the following SQL and paste it into the SQL editor:

```sql
-- Complete admin_products schema migration
-- This migration adds all missing columns needed for product import and management

-- Add missing columns to admin_products table
ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shared_variants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS customer_upload_config JSONB DEFAULT '{"enabled": false, "maxFileSize": 5, "allowedFormats": ["png", "jpg", "jpeg", "gif"], "description": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS optional_fields JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS text_area TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS condition_logic VARCHAR(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS taxes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{"productUrl": "", "pageTitle": "", "metaDescription": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS page_path TEXT DEFAULT '/';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_products_availability ON admin_products(availability);
CREATE INDEX IF NOT EXISTS idx_admin_products_created_at ON admin_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_products_sku ON admin_products(sku);

-- Update any existing rows to have the new default values if they're NULL
UPDATE admin_products SET base_price = 0 WHERE base_price IS NULL;
UPDATE admin_products SET images = '[]'::jsonb WHERE images IS NULL;
UPDATE admin_products SET options = '[]'::jsonb WHERE options IS NULL;
UPDATE admin_products SET availability = true WHERE availability IS NULL;
UPDATE admin_products SET updated_at = NOW() WHERE updated_at IS NULL;
```

### 4. Run the Query
- Click the **Run** button (or press `Ctrl+Enter`)
- You should see a success message at the bottom

### 5. Verify the Schema
- Go to **Table Editor** in the left sidebar
- Select **admin_products** table
- You should now see all the new columns in the table structure

## What This Migration Adds

| Column | Type | Purpose |
|--------|------|---------|
| `base_price` | NUMERIC | Base price for the product |
| `images` | JSONB | Array of product images |
| `options` | JSONB | Product options/variants |
| `shared_variants` | JSONB | Shared variant configurations |
| `customer_upload_config` | JSONB | Customer upload settings |
| `optional_fields` | JSONB | Optional product fields |
| `pricing_rules` | JSONB | Dynamic pricing rules |
| `categories` | JSONB | Product categories |
| `weight` | NUMERIC | Product weight |
| `availability` | BOOLEAN | Product availability status |
| `text_area` | TEXT | Additional text content |
| `condition_logic` | VARCHAR | Logic for applying conditions |
| `taxes` | JSONB | Tax configurations |
| `seo` | JSONB | SEO metadata |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `page_path` | TEXT | URL path for the product |

## After Migration

Once the migration is applied:
1. All product fields will sync correctly to Supabase
2. No more "column not found" errors
3. Create, update, and import operations will work smoothly
4. Push your code to production

## Need Help?

If you encounter any issues:
1. Check the error message in the SQL editor
2. Ensure you're in the correct Supabase project
3. Contact Supabase support if there are permission issues
