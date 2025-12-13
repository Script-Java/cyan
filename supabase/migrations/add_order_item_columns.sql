-- Migration: Add missing order_items columns
-- Purpose: Add product_name, design_file_url, and options columns that the application expects
-- These columns are used by server/utils/supabase.ts and server/routes/designs.ts

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS design_file_url TEXT,
ADD COLUMN IF NOT EXISTS options JSONB;

-- Fix design_file_url to support long URLs (TEXT type allows unlimited length)
-- Note: We do NOT create an index on design_file_url since TEXT columns with full-text indexes
-- can exceed PostgreSQL's 8KB index row size limit with very long URLs
