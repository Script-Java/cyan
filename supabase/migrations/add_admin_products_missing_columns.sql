-- Migration: Add missing columns to admin_products table
-- Purpose: Ensure admin_products table has all columns required by server code
-- This migration is idempotent and safe to run multiple times

-- Rename or add base_price column
-- If price column exists and base_price doesn't, rename it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_products' AND column_name = 'price'
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'admin_products' AND column_name = 'base_price'
    )
  ) THEN
    ALTER TABLE admin_products RENAME COLUMN price TO base_price;
  END IF;
END $$;

-- Add base_price if neither price nor base_price exists
ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Add all required JSONB and other columns
ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS customer_upload_config JSONB DEFAULT '{"enabled": false, "maxFileSize": 5, "allowedFormats": ["png", "jpg", "jpeg", "gif"], "description": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS optional_fields JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS text_area TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS condition_logic VARCHAR(50) DEFAULT 'all',
ADD COLUMN IF NOT EXISTS taxes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{"productUrl": "", "pageTitle": "", "metaDescription": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_products_sku ON admin_products(sku);
CREATE INDEX IF NOT EXISTS idx_admin_products_availability ON admin_products(availability);
CREATE INDEX IF NOT EXISTS idx_admin_products_created_at ON admin_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_products_shared_variants ON admin_products USING gin(shared_variants);
