-- Enable Row Level Security (RLS) for support_tickets table
ALTER TABLE IF EXISTS support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role (server-side) to access everything
CREATE POLICY "Service role access to support tickets"
  ON support_tickets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Deny anonymous access
CREATE POLICY "Deny anonymous support tickets access"
  ON support_tickets FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- RLS Policy: Deny authenticated access (use server-side API instead)
CREATE POLICY "Deny authenticated support tickets access"
  ON support_tickets FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Enable Row Level Security (RLS) for ticket_replies table
ALTER TABLE IF EXISTS ticket_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role (server-side) to access everything
CREATE POLICY "Service role access to ticket replies"
  ON ticket_replies FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Deny anonymous access
CREATE POLICY "Deny anonymous ticket replies access"
  ON ticket_replies FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- RLS Policy: Deny authenticated access (use server-side API instead)
CREATE POLICY "Deny authenticated ticket replies access"
  ON ticket_replies FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Add comments
COMMENT ON TABLE support_tickets IS 'Support tickets - secured with RLS to prevent unauthorized access';
COMMENT ON TABLE ticket_replies IS 'Ticket replies - secured with RLS to ensure replies are only accessed through proper API';
