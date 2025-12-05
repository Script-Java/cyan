# Database Schema Documentation

## Overview

This document describes the database schema with emphasis on ID types and their consistency across the application code.

## ID Type Strategy

The application uses **two distinct ID type strategies** based on use case:

### 1. UUID for Distributed IDs
**Used for**: Cart operations that don't rely on database auto-increment

- **Table**: `carts`
- **ID Type**: `UUID` (generated via `gen_random_uuid()`)
- **Rationale**: UUIDs are globally unique without central coordination, ideal for distributed systems. Generated server-side using Node's `crypto.randomUUID()`.
- **Validation**: All cart IDs are validated against UUID format before database queries (regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`)
- **Reference Code**: `server/routes/cart.ts`, `server/routes/checkout.ts`

### 2. Auto-Increment Integers for Entity IDs
**Used for**: Primary entities with database-managed sequential IDs

- **Table**: `customers`, `orders`, `order_items`, `admin_products`, `support_tickets`, `ticket_replies`
- **ID Type**: `BIGSERIAL` (64-bit auto-increment integers)
- **Rationale**: Provides efficient sequential IDs with automatic generation. All numeric ID parameters parsed using `parseInt()` with validation.
- **Validation**: All numeric IDs are parsed with `parseInt(id, 10)` and checked for `isNaN()` before database queries
- **Reference Code**: Most server route files (orders, products, support, etc.)

## Table Schemas

### Core Tables

#### carts
- **id**: UUID (PRIMARY KEY, default: `gen_random_uuid()`)
- **line_items**: JSONB (array of cart items)
- **subtotal**: NUMERIC(10, 2)
- **total**: NUMERIC(10, 2)
- **created_at**: TIMESTAMP WITH TIME ZONE
- **updated_at**: TIMESTAMP WITH TIME ZONE

#### customers
- **id**: BIGSERIAL (PRIMARY KEY)
- **email**: VARCHAR(255) UNIQUE
- **name**: VARCHAR(255)
- **phone**: VARCHAR(20)
- **created_at**: TIMESTAMP WITH TIME ZONE
- **updated_at**: TIMESTAMP WITH TIME ZONE

#### orders
- **id**: BIGSERIAL (PRIMARY KEY)
- **customer_id**: BIGINT (FOREIGN KEY → customers.id)
- **status**: VARCHAR(50) (default: 'pending')
- **total**: NUMERIC(10, 2)
- **subtotal**: NUMERIC(10, 2)
- **tax**: NUMERIC(10, 2)
- **shipping**: NUMERIC(10, 2)
- **billing_address**: JSONB
- **shipping_address**: JSONB
- **created_at**: TIMESTAMP WITH TIME ZONE
- **updated_at**: TIMESTAMP WITH TIME ZONE

#### order_items
- **id**: BIGSERIAL (PRIMARY KEY)
- **order_id**: BIGINT (FOREIGN KEY → orders.id ON DELETE CASCADE)
- **product_id**: BIGINT
- **quantity**: INTEGER (default: 1)
- **price**: NUMERIC(10, 2)
- **created_at**: TIMESTAMP WITH TIME ZONE

#### admin_products
- **id**: BIGSERIAL (PRIMARY KEY)
- **name**: VARCHAR(255)
- **sku**: VARCHAR(100)
- **price**: NUMERIC(10, 2)
- **description**: TEXT
- **shared_variants**: JSONB (default: '[]'::jsonb)
- **created_at**: TIMESTAMP WITH TIME ZONE
- **updated_at**: TIMESTAMP WITH TIME ZONE

### Support Tables

#### support_tickets
- **id**: BIGSERIAL (PRIMARY KEY)
- **customer_id**: BIGINT (FOREIGN KEY → customers.id ON DELETE SET NULL)
- **customer_email**: VARCHAR(255)
- **customer_name**: VARCHAR(255)
- **subject**: VARCHAR(255) NOT NULL
- **category**: VARCHAR(100)
- **priority**: VARCHAR(50) (default: 'medium', CHECK: low|medium|high|urgent)
- **status**: VARCHAR(50) (default: 'open', CHECK: open|in-progress|resolved|closed)
- **message**: TEXT
- **created_at**: TIMESTAMP WITH TIME ZONE
- **updated_at**: TIMESTAMP WITH TIME ZONE

#### ticket_replies
- **id**: BIGSERIAL (PRIMARY KEY)
- **ticket_id**: BIGINT (FOREIGN KEY → support_tickets.id ON DELETE CASCADE)
- **sender_type**: VARCHAR(50)
- **sender_name**: VARCHAR(255)
- **sender_email**: VARCHAR(255)
- **message**: TEXT
- **created_at**: TIMESTAMP WITH TIME ZONE

## Type Safety Across Layers

### Server Code
- **Numeric IDs**: Parsed with `parseInt(id, 10)`, validated with `isNaN()` checks
- **UUID IDs**: Validated with regex pattern before queries
- All Supabase queries use properly typed IDs via `.eq("id", parsedId)`

### Client Code
- **Type definitions**: `client/lib/supabase.ts` defines Database types matching server expectations
- **Support tickets**: `id: number`, `ticket_id: number` (matches BIGSERIAL in database)
- **Cart IDs**: `id: string` (matches UUID type)

### Application Code
- **server/routes/cart.ts**: Generates UUIDs via `crypto.randomUUID()`, validates with regex
- **server/routes/support.ts**: Parses numeric IDs, queries by integer
- **client/pages/MyTickets.tsx**: Types support ticket IDs as `number`
- **client/pages/AdminSupport.tsx**: Types support ticket IDs as `number`

## Migration Files

All database schema definitions are versioned in `supabase/migrations/`:

1. **define_id_column_types.sql** - Core tables with ID definitions (carts, customers, orders, admin_products)
2. **define_support_tickets_schema.sql** - Support system tables with ID definitions
3. **add_shared_variants_to_products.sql** - Product enhancements

## Error Handling

### UUID Validation Errors
- **Endpoint**: Cart operations (`/api/cart/*`)
- **Validation**: `isValidUUID(cartId)` regex check
- **Response**: `400 Bad Request` with message "Invalid cart ID format"

### Numeric ID Validation Errors
- **Endpoint**: Orders, products, support tickets, etc.
- **Validation**: `parseInt(id)` followed by `isNaN()` check
- **Response**: `400 Bad Request` with message "Invalid [entity] ID format"

### Database Constraint Errors
- **Foreign key violations**: Return `500` after logging Supabase error
- **CHECK constraint violations**: Prevent invalid status/priority values at database level

## Best Practices

1. **Always validate ID format before database queries** - This prevents ambiguous SQL errors
2. **Use TypeScript types that match database types** - Prevents type mismatches between layers
3. **Document ID type expectations in interfaces** - Both server types and Supabase client types should be consistent
4. **Use FOREIGN KEY constraints** - Maintain referential integrity at database level
5. **Create indexes on ID columns and foreign keys** - Improves query performance
6. **Use BIGSERIAL for auto-increment IDs** - Provides 64-bit range for future growth

## Migration Instructions

To apply these migrations to your Supabase project:

1. Navigate to your Supabase project dashboard
2. Go to the **SQL Editor** section
3. Copy the contents of each migration file from `supabase/migrations/`
4. Run each migration in order (start with `define_id_column_types.sql`, then `define_support_tickets_schema.sql`)
5. Verify tables were created: Check the **Database** section in Supabase

Alternatively, if using Supabase CLI:
```bash
supabase db push
```

This will apply all migrations in `supabase/migrations/` to your Supabase project.
