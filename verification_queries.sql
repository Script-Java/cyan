-- ============================================
-- Phase 3: Supabase Data Verification Queries
-- ============================================

-- Replace '[your_order_id]' with the actual order ID from your test

-- ============================================
-- 1. Verify Order Status
-- ============================================
-- Expected: status should be "paid" (NOT "pending_payment" or "processing")

SELECT 
  id,
  status,
  created_at,
  updated_at
FROM orders
WHERE id = '[your_order_id]';


-- ============================================
-- 2. Verify Square Metadata
-- ============================================
-- Expected: 
--   - square_order_id should NOT be NULL
--   - square_payment_details should contain a JSON object with tender_id and verified_at

SELECT 
  id,
  square_order_id,
  square_payment_details
FROM orders
WHERE id = '[your_order_id]';


-- ============================================
-- 3. Verify Store Credit (If Applicable)
-- ============================================
-- Expected: If store credit was used, customers.store_credit should reflect the deducted amount

SELECT 
  id,
  email,
  store_credit
FROM customers
WHERE id = '[customer_id]';


-- ============================================
-- 4. Get Full Order Details with Customer Info
-- ============================================
-- This query combines order and customer data for comprehensive verification

SELECT 
  o.id,
  o.status,
  o.square_order_id,
  o.square_payment_details,
  o.total,
  o.subtotal,
  o.tax,
  o.shipping,
  o.discount,
  o.discount_code,
  o.created_at,
  o.updated_at,
  c.email as customer_email,
  c.first_name,
  c.last_name,
  c.store_credit
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.id = '[your_order_id]';


-- ============================================
-- 5. Get Order Items
-- ============================================
-- Verify all products and quantities are correct

SELECT 
  oi.id,
  oi.order_id,
  oi.product_id,
  oi.product_name,
  oi.quantity,
  oi.price,
  oi.design_file_url,
  oi.options
FROM order_items oi
WHERE oi.order_id = '[your_order_id]';


-- ============================================
-- 6. Get Recent Orders (for testing multiple orders)
-- ============================================
-- Shows the 10 most recent orders with their status

SELECT 
  o.id,
  o.status,
  o.total,
  o.created_at,
  c.email as customer_email,
  o.square_order_id
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC
LIMIT 10;


-- ============================================
-- 7. Verify Payment Details JSON Structure
-- ============================================
-- This query extracts specific fields from the square_payment_details JSON

SELECT 
  id,
  status,
  square_order_id,
  square_payment_details->>'payment_id' as payment_id,
  square_payment_details->>'payment_status' as payment_status,
  square_payment_details->>'amount' as amount,
  square_payment_details->>'card_brand' as card_brand,
  square_payment_details->>'card_last_4' as card_last_4,
  square_payment_details->>'receipt_number' as receipt_number
FROM orders
WHERE id = '[your_order_id]';


-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================
-- ✅ Query 1: status = "paid"
-- ✅ Query 2: square_order_id is NOT NULL
-- ✅ Query 2: square_payment_details contains payment_id, payment_status, etc.
-- ✅ Query 3: store_credit reflects deduction (if applicable)
-- ✅ Query 4: All order totals are correct
-- ✅ Query 7: Payment details JSON contains all expected fields
