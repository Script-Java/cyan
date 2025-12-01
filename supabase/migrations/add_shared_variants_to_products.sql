-- Add shared_variants column to admin_products table if it doesn't exist
ALTER TABLE admin_products 
ADD COLUMN IF NOT EXISTS shared_variants JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_products_shared_variants ON admin_products USING gin(shared_variants);
