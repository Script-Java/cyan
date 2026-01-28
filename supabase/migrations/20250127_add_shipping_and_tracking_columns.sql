-- Add shipping and tracking columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS tracking_carrier VARCHAR(100),
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS shipped_date TIMESTAMP WITH TIME ZONE;

-- Add comments for clarity
COMMENT ON COLUMN orders.shipping_address IS 'Customer shipping address in JSON format with first_name, last_name, street_1, street_2, city, state_or_province, postal_code, country_iso2, phone';
COMMENT ON COLUMN orders.tracking_number IS 'Shipping tracking number';
COMMENT ON COLUMN orders.tracking_carrier IS 'Shipping carrier (e.g., UPS, FedEx, DHL, USPS)';
COMMENT ON COLUMN orders.tracking_url IS 'Direct link to tracking page';
COMMENT ON COLUMN orders.shipped_date IS 'Date when order was shipped';

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_date ON orders(shipped_date);
