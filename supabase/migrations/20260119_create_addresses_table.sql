-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  street_1 TEXT NOT NULL,
  street_2 TEXT,
  city VARCHAR(255) NOT NULL,
  state_or_province VARCHAR(255) NOT NULL,
  postal_code VARCHAR(64) NOT NULL,
  country_code VARCHAR(8) NOT NULL,
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_created_at ON addresses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);
