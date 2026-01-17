# Supabase SQL Migrations - Corrected

## For admin_products table

Copy and paste this EXACTLY (it's simpler and cleaner):

```sql
ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2) DEFAULT 0.00;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS shared_variants JSONB DEFAULT '[]'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS customer_upload_config JSONB DEFAULT '{"enabled": false, "maxFileSize": 5, "allowedFormats": ["png", "jpg", "jpeg", "gif"], "description": ""}'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS optional_fields JSONB DEFAULT '[]'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '[]'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 2) DEFAULT 0;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS text_area TEXT DEFAULT '';

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS condition_logic VARCHAR(50) DEFAULT 'all';

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS taxes JSONB DEFAULT '[]'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{"productUrl": "", "pageTitle": "", "metaDescription": ""}'::jsonb;

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS page_path TEXT DEFAULT '/';

CREATE INDEX IF NOT EXISTS idx_admin_products_sku ON admin_products(sku);

CREATE INDEX IF NOT EXISTS idx_admin_products_availability ON admin_products(availability);
```

## For orders table

Copy and paste this:

```sql
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}'::jsonb;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}'::jsonb;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
```

## How to Apply

1. Go to **https://app.supabase.com**
2. Select your project
3. Click **SQL Editor** → **+ New Query**
4. **Copy ONE migration** above (either admin_products OR orders, not both at once)
5. **Paste it** into the editor
6. Click **Run**
7. Wait for "Success" message
8. Repeat for the other migration

**Each migration should be run separately in its own query!**
