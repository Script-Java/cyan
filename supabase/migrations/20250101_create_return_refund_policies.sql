-- Create return_refund_policies table
create table if not exists return_refund_policies (
  id text primary key default 'default',
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table return_refund_policies enable row level security;

-- Public read policy
create policy "Public read policy"
  on return_refund_policies for select
  using (true);

-- Admin update policy (simplified - for authenticated users)
create policy "Admin update policy"
  on return_refund_policies for update
  to authenticated
  using (true);

-- Admin insert policy (simplified - for authenticated users)
create policy "Admin insert policy"
  on return_refund_policies for insert
  to authenticated
  with check (true);

-- Insert default policy
insert into return_refund_policies (id, content) values
('default', '{
  "guarantee_days": 30,
  "return_conditions": [
    "Stickers must be unused and in original condition",
    "Original packaging must be intact",
    "Proof of purchase (order number) is required",
    "Return shipping is the customer''s responsibility"
  ],
  "how_to_return": [
    "Contact our support team at support@stickyhub.com with your order number",
    "Provide a reason for your return request",
    "We''ll review your request and provide return shipping instructions",
    "Ship the item back to us using the provided address",
    "Once received and inspected, we''ll process your refund (5-7 business days)"
  ],
  "defective_items_days": 7,
  "refund_timeline": "5-7 business days after we receive and inspect your return",
  "non_returnable_items": [
    "Used, applied, or partially used stickers",
    "Items without original packaging",
    "Items returned after 30 days",
    "Wholesale or bulk orders (special terms apply)"
  ],
  "contact_email": "support@stickyhub.com",
  "full_policy": ""
}')
on conflict (id) do nothing;
