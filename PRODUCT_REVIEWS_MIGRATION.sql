-- Product Reviews Migration
-- Run this SQL in your Supabase SQL Editor to create the product_reviews table
-- 
-- Steps:
-- 1. Go to your Supabase dashboard (https://app.supabase.com/)
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Create a new query
-- 5. Copy and paste the SQL below
-- 6. Click "Run"

-- Create product_reviews table for storing customer reviews with images
CREATE TABLE IF NOT EXISTS product_reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  reviewer_email VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title VARCHAR(255),
  comment TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved reviews (public read access)
CREATE POLICY "Allow public to read approved reviews" ON product_reviews
  FOR SELECT
  USING (status = 'approved');

-- Allow anyone to insert reviews (guest reviews allowed)
CREATE POLICY "Allow anyone to create reviews" ON product_reviews
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to read all reviews (for moderation)
CREATE POLICY "Allow admins to read all reviews" ON product_reviews
  FOR SELECT
  USING (auth.jwt()->>'role' = 'authenticated');

-- Allow admins to update review status (for moderation)
CREATE POLICY "Allow admins to update reviews" ON product_reviews
  FOR UPDATE
  USING (auth.jwt()->>'role' = 'authenticated')
  WITH CHECK (auth.jwt()->>'role' = 'authenticated');

-- Allow admins to delete reviews
CREATE POLICY "Allow admins to delete reviews" ON product_reviews
  FOR DELETE
  USING (auth.jwt()->>'role' = 'authenticated');
