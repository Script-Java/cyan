-- Migration: Define support tickets schema with proper ID types
-- Purpose: Establish support ticket and ticket reply tables with consistent auto-increment ID types
-- References: server/routes/support.ts expects numeric IDs; client/lib/supabase.ts declares IDs as number

-- 1. SUPPORT_TICKETS TABLE - Uses auto-increment integer IDs
CREATE TABLE IF NOT EXISTS support_tickets (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_email ON support_tickets(customer_email);

-- 2. TICKET_REPLIES TABLE - Uses auto-increment integer IDs, references support_tickets
CREATE TABLE IF NOT EXISTS ticket_replies (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type VARCHAR(50),
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_created_at ON ticket_replies(created_at);

-- CONSTRAINTS: Ensure data integrity
-- Status values are constrained to specific options
ALTER TABLE support_tickets 
ADD CONSTRAINT check_ticket_status 
CHECK (status IN ('open', 'in-progress', 'resolved', 'closed'));

-- Priority values are constrained to specific options
ALTER TABLE support_tickets 
ADD CONSTRAINT check_ticket_priority 
CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
