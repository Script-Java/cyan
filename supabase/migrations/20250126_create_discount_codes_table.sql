-- Create discount_codes table
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups by code
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON public.discount_codes(is_active);

-- Enable Row Level Security
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to read active discount codes (for validation during checkout)
CREATE POLICY "Allow public to read active discount codes" ON public.discount_codes
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP));

-- Allow only admins to manage discount codes
CREATE POLICY "Allow admins to manage discount codes" ON public.discount_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.customers 
      WHERE customers.id = auth.uid()::int 
      AND customers.is_admin = true
    )
  );
