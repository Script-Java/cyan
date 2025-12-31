-- Migration: Add avatar_url column to customers table
-- Purpose: Store customer profile photo/avatar URLs

ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
