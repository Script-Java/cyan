-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  billing_address JSONB,
  invoice_type VARCHAR(50) NOT NULL CHECK (invoice_type IN ('Standard', 'ArtworkUpload')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('Draft', 'Sent', 'Unpaid', 'Paid', 'Overdue', 'Canceled')) DEFAULT 'Draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  notes TEXT,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  discount_type VARCHAR(20) CHECK (discount_type IN ('fixed', 'percentage')),
  total DECIMAL(10, 2) NOT NULL,
  sent_date TIMESTAMP,
  paid_date TIMESTAMP,
  canceled_date TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create invoice_line_items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  tax_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_tokens table (for customer payment links)
CREATE TABLE IF NOT EXISTS invoice_tokens (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  views INT DEFAULT 0,
  last_viewed_at TIMESTAMP
);

-- Create invoice_artwork table (for artwork uploads)
CREATE TABLE IF NOT EXISTS invoice_artwork (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  cloudinary_public_id VARCHAR(255),
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uploaded_by VARCHAR(255)
);

-- Create invoice_activity table (for timeline)
CREATE TABLE IF NOT EXISTS invoice_activity (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);
CREATE INDEX idx_invoice_tokens_token ON invoice_tokens(token);
CREATE INDEX idx_invoice_tokens_invoice_id ON invoice_tokens(invoice_id);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_artwork_invoice_id ON invoice_artwork(invoice_id);
CREATE INDEX idx_invoice_activity_invoice_id ON invoice_activity(invoice_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_artwork ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins only
CREATE POLICY "Admins can manage invoices" ON invoices
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage line items" ON invoice_line_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM invoices 
    WHERE id = invoice_id 
    AND auth.jwt() ->> 'role' = 'admin'
  ));

CREATE POLICY "Anyone can view tokens" ON invoice_tokens
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage artwork" ON invoice_artwork
  FOR ALL USING (EXISTS (
    SELECT 1 FROM invoices 
    WHERE id = invoice_id 
    AND auth.jwt() ->> 'role' = 'admin'
  ));

CREATE POLICY "Admins can manage activity" ON invoice_activity
  FOR ALL USING (EXISTS (
    SELECT 1 FROM invoices 
    WHERE id = invoice_id 
    AND auth.jwt() ->> 'role' = 'admin'
  ));
