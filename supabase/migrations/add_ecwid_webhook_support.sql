-- Migration: Add Ecwid webhook support columns
-- Purpose: Add columns needed for Ecwid order and customer synchronization via webhooks

-- 1. Update CUSTOMERS table to add Ecwid-related columns and missing fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ecwid_customer_id BIGINT UNIQUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS store_credit NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create index on ecwid_customer_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_customers_ecwid_customer_id ON customers(ecwid_customer_id);

-- 2. Update ORDERS table to add Ecwid-related columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ecwid_order_id BIGINT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ecwid_customer_id BIGINT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ecwid_order_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;

-- Create indexes on Ecwid IDs for webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_ecwid_order_id ON orders(ecwid_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_ecwid_customer_id ON orders(ecwid_customer_id);
