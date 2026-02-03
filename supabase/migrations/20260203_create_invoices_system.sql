-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  company VARCHAR(255),
  invoice_type VARCHAR(50) NOT NULL DEFAULT 'Standard',
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  issue_date TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  discount_type VARCHAR(50),
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  sent_date TIMESTAMP,
  paid_date TIMESTAMP,
  canceled_date TIMESTAMP,
  cancellation_reason TEXT,
  metadata JSONB,
  billing_address JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by BIGINT,
  payment_method VARCHAR(100),
  payment_reference VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255)
);

-- Create invoice_line_items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create invoice_activity table
CREATE TABLE IF NOT EXISTS invoice_activity (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  user_id BIGINT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create invoice_artwork table for design files
CREATE TABLE IF NOT EXISTS invoice_artwork (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_activity_invoice_id ON invoice_activity(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_artwork_invoice_id ON invoice_artwork(invoice_id);
