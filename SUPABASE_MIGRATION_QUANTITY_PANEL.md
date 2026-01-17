# Supabase Migration: Add Quantity Panel Settings

This migration adds the missing `show_quantity_panel` and `fixed_quantity` columns to the `admin_products` table that are required for the quantity selection panel functionality.

## Steps to Apply Migration

### 1. Go to Supabase Dashboard
- Visit https://app.supabase.com
- Select your project: **nbzttuomtdtsfzcagfnh**

### 2. Open SQL Editor
- Click on the **SQL Editor** in the left sidebar
- Click **+ New Query** to create a new SQL query

### 3. Copy and Paste the Migration

Copy the following SQL and paste it into the SQL editor:

```sql
-- Add quantity panel settings columns to admin_products table
ALTER TABLE admin_products
ADD COLUMN IF NOT EXISTS show_quantity_panel BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS fixed_quantity INTEGER DEFAULT NULL;

-- Create an index for better query performance on show_quantity_panel
CREATE INDEX IF NOT EXISTS idx_admin_products_show_quantity_panel ON admin_products(show_quantity_panel);

-- Update any existing rows to have the new default values if they're NULL
UPDATE admin_products SET show_quantity_panel = true WHERE show_quantity_panel IS NULL;
```

### 4. Run the Query
- Click the **Run** button (or press `Ctrl+Enter`)
- You should see a success message at the bottom showing "1 query succeeded"

### 5. Verify the Schema
- Go to **Table Editor** in the left sidebar
- Select **admin_products** table
- You should now see the new columns: `show_quantity_panel` (boolean) and `fixed_quantity` (integer)

## What This Migration Adds

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `show_quantity_panel` | BOOLEAN | true | Whether to show the quantity tier selection panel on the storefront |
| `fixed_quantity` | INTEGER | NULL | If set, customers can only order this fixed quantity (overrides the panel) |

## After Migration

Once the migration is applied:
1. The "Show Quantity Selection Panel" toggle in the Admin Product Form will work correctly
2. You can set a "Fixed Quantity" to force a specific order quantity
3. These settings will persist to the database and display correctly on the storefront
4. The quantity panel will show/hide based on your admin settings

## Example Behavior

### When `show_quantity_panel = true` and `fixed_quantity = NULL`
- Customer sees the quantity tier selection panel
- Customer can choose from available quantity options

### When `show_quantity_panel = false` and `fixed_quantity = NULL`
- Customer does NOT see the quantity tier selection panel
- Customer defaults to quantity of 1

### When `show_quantity_panel = false` and `fixed_quantity = 5`
- Customer sees a fixed quantity message (e.g., "Minimum order: 5 units")
- Customer cannot change the quantity

## Need Help?

If you encounter any issues:
1. Check the error message in the SQL editor
2. Ensure you're in the correct Supabase project (nbzttuomtdtsfzcagfnh)
3. Contact Supabase support if there are permission issues

## Rollback (if needed)

If you need to remove these columns (not recommended):

```sql
ALTER TABLE admin_products
DROP COLUMN IF EXISTS show_quantity_panel,
DROP COLUMN IF EXISTS fixed_quantity;

DROP INDEX IF EXISTS idx_admin_products_show_quantity_panel;
```
