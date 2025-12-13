-- Migration: Add missing order_items columns
-- Purpose: Add product_name, design_file_url, and options columns that the application expects
-- These columns are used by server/utils/supabase.ts and server/routes/designs.ts

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS design_file_url TEXT,
ADD COLUMN IF NOT EXISTS options JSONB;

-- Fix design_file_url to support long URLs
ALTER TABLE order_items ALTER COLUMN design_file_url TYPE TEXT;

-- Create index on design_file_url for efficient filtering in designs.ts
CREATE INDEX IF NOT EXISTS idx_order_items_design_file_url ON order_items(design_file_url) WHERE design_file_url IS NOT NULL;
