-- NOTE: This application uses custom JWT authentication (not Supabase Auth)
-- and accesses Supabase via service key on the server side.
-- RLS policies below provide defense-in-depth:
-- - Service role (used by server) bypasses RLS
-- - If anon key is ever exposed or misused, these policies prevent unauthorized data access
-- - Enable RLS for all sensitive tables as a security best practice

-- Enable Row Level Security (RLS) for customers table
alter table if exists customers enable row level security;

-- RLS Policy: Allow service role (server-side) to access everything
create policy "Service role access to customers"
  on customers for all
  to service_role
  using (true)
  with check (true);

-- RLS Policy: Deny anonymous access to sensitive customer data
create policy "Deny anonymous customer access"
  on customers for all
  to anon
  using (false)
  with check (false);

-- RLS Policy: Deny direct authenticated access (use server-side API instead)
create policy "Deny unauthenticated customer access"
  on customers for all
  to authenticated
  using (false)
  with check (false);


-- Enable Row Level Security (RLS) for orders table
alter table if exists orders enable row level security;

-- RLS Policy: Allow service role (server-side) to access everything
create policy "Service role access to orders"
  on orders for all
  to service_role
  using (true)
  with check (true);

-- RLS Policy: Deny anonymous access
create policy "Deny anonymous orders access"
  on orders for all
  to anon
  using (false)
  with check (false);

-- RLS Policy: Deny authenticated access (use server-side API instead)
create policy "Deny unauthenticated orders access"
  on orders for all
  to authenticated
  using (false)
  with check (false);


-- Enable RLS for order_items table if it exists
alter table if exists order_items enable row level security;

-- RLS Policy: Allow service role access
create policy "Service role access to order items"
  on order_items for all
  to service_role
  using (true)
  with check (true);

-- RLS Policy: Deny anonymous access
create policy "Deny anonymous order items access"
  on order_items for all
  to anon
  using (false)
  with check (false);

-- RLS Policy: Deny authenticated access
create policy "Deny unauthenticated order items access"
  on order_items for all
  to authenticated
  using (false)
  with check (false);


-- Enable RLS for addresses table if it exists
alter table if exists addresses enable row level security;

-- RLS Policy: Allow service role access
create policy "Service role access to addresses"
  on addresses for all
  to service_role
  using (true)
  with check (true);

-- RLS Policy: Deny anonymous access
create policy "Deny anonymous addresses access"
  on addresses for all
  to anon
  using (false)
  with check (false);

-- RLS Policy: Deny authenticated access
create policy "Deny unauthenticated addresses access"
  on addresses for all
  to authenticated
  using (false)
  with check (false);


-- Add comment explaining RLS setup
comment on table customers is 'Customer profiles - secured with RLS to prevent unauthorized access';
comment on table orders is 'Customer orders - secured with RLS to ensure customers only see their own orders';
comment on table order_items is 'Order line items - secured with RLS through order relationship';
comment on table addresses is 'Customer shipping/billing addresses - secured with RLS to prevent cross-customer access';
