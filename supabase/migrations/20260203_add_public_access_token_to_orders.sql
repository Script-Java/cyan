-- Add public_access_token column to orders for public order tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS public_access_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Create index for faster lookups by public access token
CREATE INDEX IF NOT EXISTS idx_orders_public_access_token ON orders(public_access_token);
