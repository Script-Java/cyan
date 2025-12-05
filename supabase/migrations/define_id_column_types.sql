-- Migration: Define ID column types for core tables
-- Purpose: Ensure consistent and type-safe primary key definitions across the database
-- This migration establishes the authoritative ID types that are referenced in application code

-- 1. CARTS TABLE - Uses UUID for distributed ID generation
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at DESC);

-- 2. CUSTOMERS TABLE - Uses auto-increment integer IDs
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for authentication lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 3. ORDERS TABLE - Uses auto-increment integer IDs, references customers
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total NUMERIC(10, 2),
  subtotal NUMERIC(10, 2),
  tax NUMERIC(10, 2),
  shipping NUMERIC(10, 2),
  billing_address JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 4. ORDER_ITEMS TABLE - Line items for orders, references orders
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT,
  quantity INTEGER DEFAULT 1,
  price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. ADMIN_PRODUCTS TABLE - Uses auto-increment integer IDs
CREATE TABLE IF NOT EXISTS admin_products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  sku VARCHAR(100),
  price NUMERIC(10, 2),
  description TEXT,
  shared_variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_products_sku ON admin_products(sku);
CREATE INDEX IF NOT EXISTS idx_admin_products_shared_variants ON admin_products USING gin(shared_variants);
