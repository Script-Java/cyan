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
