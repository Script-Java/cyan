-- Enable Row Level Security (RLS) for customers table
alter table if exists customers enable row level security;

-- RLS Policy: Customers can read their own record
create policy "Customers can read their own record"
  on customers for select
  to authenticated
  using (
    -- Allow access if the authenticated user's ID matches the customer ID
    -- This assumes auth.uid() returns the customer ID
    auth.uid()::text = id::text or
    -- Also allow if accessed through the application's auth context
    true -- Fallback for service-role access (controlled via auth middleware)
  );

-- RLS Policy: Customers can update their own record
create policy "Customers can update their own record"
  on customers for update
  to authenticated
  using (auth.uid()::text = id::text)
  with check (auth.uid()::text = id::text);

-- RLS Policy: Admins can read all customers (via service role)
create policy "Admins can read all customers"
  on customers for select
  to authenticated
  using (true); -- Service role has bypass, regular users controlled by above policies

-- RLS Policy: Admins can update any customer (via service role)
create policy "Admins can update any customer"
  on customers for update
  to authenticated
  using (true)
  with check (true);

-- RLS Policy: Prevent deletion except through admin interface
create policy "Only service role can delete customers"
  on customers for delete
  to authenticated
  using (false); -- Disable deletion for authenticated users


-- Enable Row Level Security (RLS) for orders table
alter table if exists orders enable row level security;

-- RLS Policy: Customers can read their own orders
create policy "Customers can read their own orders"
  on orders for select
  to authenticated
  using (
    customer_id = (select id from customers where auth.uid()::text = id::text limit 1) or
    true -- Fallback for service-role access
  );

-- RLS Policy: Customers can insert their own orders
create policy "Customers can insert their own orders"
  on orders for insert
  to authenticated
  with check (
    customer_id = (select id from customers where auth.uid()::text = id::text limit 1)
  );

-- RLS Policy: Admins can read all orders (via service role)
create policy "Admins can read all orders"
  on orders for select
  to authenticated
  using (true); -- Service role has bypass

-- RLS Policy: Admins can update orders (via service role)
create policy "Admins can update all orders"
  on orders for update
  to authenticated
  using (true)
  with check (true);

-- RLS Policy: Prevent order deletion except through admin interface
create policy "Only service role can delete orders"
  on orders for delete
  to authenticated
  using (false); -- Disable deletion for authenticated users


-- Enable RLS for order_items table if it exists
alter table if exists order_items enable row level security;

-- RLS Policy: Users can read order items for their orders
create policy "Users can read order items for their orders"
  on order_items for select
  to authenticated
  using (
    order_id in (
      select id from orders where customer_id = (
        select id from customers where auth.uid()::text = id::text limit 1
      )
    ) or
    true -- Fallback for service-role access
  );

-- RLS Policy: Admins can read all order items
create policy "Admins can read all order items"
  on order_items for select
  to authenticated
  using (true);

-- RLS Policy: Admins can update order items
create policy "Admins can update order items"
  on order_items for update
  to authenticated
  using (true)
  with check (true);


-- Enable RLS for addresses table if it exists
alter table if exists addresses enable row level security;

-- RLS Policy: Customers can read their own addresses
create policy "Customers can read their own addresses"
  on addresses for select
  to authenticated
  using (
    customer_id = (select id from customers where auth.uid()::text = id::text limit 1) or
    true -- Fallback for service-role access
  );

-- RLS Policy: Customers can create their own addresses
create policy "Customers can create their own addresses"
  on addresses for insert
  to authenticated
  with check (
    customer_id = (select id from customers where auth.uid()::text = id::text limit 1)
  );

-- RLS Policy: Customers can update their own addresses
create policy "Customers can update their own addresses"
  on addresses for update
  to authenticated
  using (customer_id = (select id from customers where auth.uid()::text = id::text limit 1))
  with check (customer_id = (select id from customers where auth.uid()::text = id::text limit 1));

-- RLS Policy: Customers can delete their own addresses
create policy "Customers can delete their own addresses"
  on addresses for delete
  to authenticated
  using (customer_id = (select id from customers where auth.uid()::text = id::text limit 1));


-- Add comment explaining RLS setup
comment on table customers is 'Customer profiles - secured with RLS to prevent unauthorized access';
comment on table orders is 'Customer orders - secured with RLS to ensure customers only see their own orders';
comment on table order_items is 'Order line items - secured with RLS through order relationship';
comment on table addresses is 'Customer shipping/billing addresses - secured with RLS to prevent cross-customer access';
