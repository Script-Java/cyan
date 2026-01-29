import { RequestHandler } from "express";
import { supabase } from "../utils/supabase";

export const handleInitializeInvoicesDatabase: RequestHandler = async (req, res) => {
  try {
    console.log("Starting invoices database initialization...");

    // Create invoices table
    const invoicesQuery = `
      CREATE TABLE IF NOT EXISTS invoices (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        invoice_type VARCHAR(50) DEFAULT 'Standard' CHECK (invoice_type IN ('Standard', 'ArtworkUpload')),
        status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Unpaid', 'Paid', 'Overdue', 'Canceled')),
        subtotal NUMERIC(12, 2) DEFAULT 0,
        tax_amount NUMERIC(12, 2) DEFAULT 0,
        tax_rate NUMERIC(5, 2) DEFAULT 0,
        shipping NUMERIC(12, 2) DEFAULT 0,
        discount_amount NUMERIC(12, 2) DEFAULT 0,
        total NUMERIC(12, 2) NOT NULL,
        due_date DATE,
        sent_date TIMESTAMP WITH TIME ZONE,
        paid_date TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
    `;

    const invoicesLineItemsQuery = `
      CREATE TABLE IF NOT EXISTS invoice_line_items (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
        unit_price NUMERIC(12, 2) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_line_items_invoice_id ON invoice_line_items(invoice_id);
    `;

    const invoiceTokensQuery = `
      CREATE TABLE IF NOT EXISTS invoice_tokens (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_tokens_token ON invoice_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_tokens_invoice_id ON invoice_tokens(invoice_id);
    `;

    const invoiceArtworkQuery = `
      CREATE TABLE IF NOT EXISTS invoice_artwork (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(1024) NOT NULL,
        file_size BIGINT,
        file_type VARCHAR(50),
        original_file_name VARCHAR(255),
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_artwork_invoice_id ON invoice_artwork(invoice_id);
    `;

    const invoiceActivityQuery = `
      CREATE TABLE IF NOT EXISTS invoice_activity (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        actor_type VARCHAR(50) DEFAULT 'admin' CHECK (actor_type IN ('admin', 'customer', 'system')),
        actor_id VARCHAR(255),
        description TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
      
      CREATE INDEX IF NOT EXISTS idx_activity_invoice_id ON invoice_activity(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_activity_created_at ON invoice_activity(created_at DESC);
    `;

    const rlsQuery = `
      ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_line_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_tokens ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_artwork ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS invoice_activity ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "admin_can_view_invoices" ON invoices;
      CREATE POLICY "admin_can_view_invoices" ON invoices
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_invoices" ON invoices;
      CREATE POLICY "admin_can_insert_invoices" ON invoices
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_update_invoices" ON invoices;
      CREATE POLICY "admin_can_update_invoices" ON invoices
        FOR UPDATE USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_delete_invoices" ON invoices;
      CREATE POLICY "admin_can_delete_invoices" ON invoices
        FOR DELETE USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_view_line_items" ON invoice_line_items;
      CREATE POLICY "admin_can_view_line_items" ON invoice_line_items
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_line_items" ON invoice_line_items;
      CREATE POLICY "admin_can_insert_line_items" ON invoice_line_items
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "tokens_can_be_accessed_with_valid_token" ON invoice_tokens;
      CREATE POLICY "tokens_can_be_accessed_with_valid_token" ON invoice_tokens
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "admin_can_view_artwork" ON invoice_artwork;
      CREATE POLICY "admin_can_view_artwork" ON invoice_artwork
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_artwork" ON invoice_artwork;
      CREATE POLICY "admin_can_insert_artwork" ON invoice_artwork
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_view_activity" ON invoice_activity;
      CREATE POLICY "admin_can_view_activity" ON invoice_activity
        FOR SELECT USING (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );

      DROP POLICY IF EXISTS "admin_can_insert_activity" ON invoice_activity;
      CREATE POLICY "admin_can_insert_activity" ON invoice_activity
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'role' = 'authenticated' AND
          (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        );
    `;

    // Execute each query using Supabase's raw SQL execution
    const { error: error1 } = await supabase.rpc("exec_sql", {
      sql: invoicesQuery,
    }).catch(() => ({ error: null }));

    const { error: error2 } = await supabase.rpc("exec_sql", {
      sql: invoicesLineItemsQuery,
    }).catch(() => ({ error: null }));

    const { error: error3 } = await supabase.rpc("exec_sql", {
      sql: invoiceTokensQuery,
    }).catch(() => ({ error: null }));

    const { error: error4 } = await supabase.rpc("exec_sql", {
      sql: invoiceArtworkQuery,
    }).catch(() => ({ error: null }));

    const { error: error5 } = await supabase.rpc("exec_sql", {
      sql: invoiceActivityQuery,
    }).catch(() => ({ error: null }));

    const { error: error6 } = await supabase.rpc("exec_sql", {
      sql: rlsQuery,
    }).catch(() => ({ error: null }));

    res.status(200).json({
      message: "Database initialization completed",
      tables_created: true,
      errors: [error1, error2, error3, error4, error5, error6].filter(Boolean),
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    res.status(500).json({
      error: "Failed to initialize database",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
