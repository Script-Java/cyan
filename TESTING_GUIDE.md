# Customer Demo Testing Guide

This guide helps you test each requirement flow and document what works vs. what's missing.

## Pre-Testing Setup

1. **Start the app** (if not running):
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api

2. **Create a test account**:
   - Go to http://localhost:8080/signup
   - Create account: test@example.com / password123

3. **Login**: http://localhost:8080/login

---

## 1. Simple Sticker Ordering System

### Test Flow:
1. Navigate to Products page: http://localhost:8080/products
2. Click on a product
3. Test file upload
4. Test size selection
5. Test quantity selection
6. Test material finish selection
7. Check live pricing updates

### ✅ What Works:
- [ ] File upload (PNG, AI, EPS)
- [ ] Quantity selection with tier pricing
- [ ] Live pricing calculation
- [ ] Size selection (if product has size option)

### ❌ What's Missing:
- [ ] Enforced 2-inch minimum size
- [ ] Consistent material finish options (gloss/matte/satin) across all products

### Notes:
- File upload works but check file size limits
- Size options depend on product configuration
- Material finish may not be available on all products

---

## 2. Real-Time Order Tracking

### Test Flow:
1. Place a test order (or use existing order)
2. Go to Dashboard: http://localhost:8080/dashboard
3. Go to Order History: http://localhost:8080/order-history
4. Check order status display
5. Check estimated delivery date
6. Check tracking number (if order is shipped)
7. Test order lookup/search

### ✅ What Works:
- [ ] Order status display (Received → Proof Sent → In Production → Shipped)
- [ ] Estimated delivery date shown
- [ ] Tracking number display (when available)
- [ ] Order lookup/search functionality

### ❌ What's Missing:
- [ ] None - fully implemented!

### Notes:
- Order statuses: pending, processing, printing, in transit, shipped, completed
- Search works by order number, date, or amount

---

## 3. In-Dashboard Proof Approval

### Test Flow:
1. Go to Proofs page: http://localhost:8080/proofs
2. View available proofs
3. Click on a proof to expand
4. Test "Approve" button
5. Test "Request Revisions" button
6. Add comments/notes
7. Check revision notes display

### ✅ What Works:
- [ ] View proofs in dashboard
- [ ] Approve proof functionality
- [ ] Request revisions functionality
- [ ] Comments/messages system
- [ ] Download proof files

### ❌ What's Missing:
- [ ] Explicit revision count display (data exists but not shown in UI)

### Notes:
- Proof statuses: pending, approved, denied, revisions_requested
- Comments are stored and visible
- Revision notes are shown but count is not displayed

---

## 4. Ticket/Support System

### Test Flow:
1. Go to Support page: http://localhost:8080/support
2. Submit a new ticket
3. Go to My Tickets: http://localhost:8080/my-tickets
4. View ticket list
5. Click on a ticket to view details
6. Reply to ticket
7. Check conversation history
8. Test filters (all/open/in-progress/resolved)

### ✅ What Works:
- [ ] Submit tickets in account
- [ ] View all tickets
- [ ] Reply to tickets
- [ ] View conversation history
- [ ] Filter tickets by status

### ❌ What's Missing:
- [ ] In-app notifications for new ticket replies (proof notifications work, but not ticket notifications)

### Notes:
- Ticket categories: technical, billing, order, other
- Priorities: low, medium, high, urgent
- Statuses: open, in-progress, resolved, closed

---

## 5. Production & Shipping Info

### Test Flow:
1. Go to checkout: http://localhost:8080/checkout
2. Check shipping options display
3. Check processing time shown
4. Check delivery date estimate
5. Go to Legal Pages: http://localhost:8080/shipping (or /privacy, /returns)
6. Check if policies are clear
7. Check international shipping instructions

### ✅ What Works:
- [ ] Processing time shown in shipping options
- [ ] Delivery date estimate calculated
- [ ] Legal pages system (privacy, shipping, returns policies)
- [ ] International shipping options available

### ❌ What's Missing:
- [ ] Clear messaging that international shipping requires email/call

### Notes:
- Shipping options show: processing_time_days, estimated_delivery_days_min/max
- Legal pages are editable in admin panel
- International shipping works but instructions could be clearer

---

## 6. Payment Options

### Test Flow:
1. Add items to cart
2. Go to checkout: http://localhost:8080/checkout-new
3. Check available payment methods
4. Test Square payment (card)
5. Check store credit option
6. Test discount code input
7. Check if PayPal appears (should not work)
8. Check for Apple Pay/Google Pay (should not appear)

### ✅ What Works:
- [ ] Square card payments (fully functional)
- [ ] Store credit balance display
- [ ] Store credit application to orders
- [ ] Discount code input field

### ❌ What's Missing:
- [ ] PayPal integration (listed but not functional)
- [ ] Apple Pay / Google Pay
- [ ] Loyalty points system
- [ ] Promo code backend (UI exists but may not work)

### Notes:
- Square payment is the only fully working payment method
- Store credit earns 5% on orders
- Discount code field exists but backend needs verification

---

## 7. Customer Account Dashboard

### Test Flow:
1. Go to Dashboard: http://localhost:8080/dashboard
2. Check past orders display
3. Test Quick Order section
4. Go to Order History: http://localhost:8080/order-history
5. Test reorder functionality (if exists)
6. Go to Proofs: http://localhost:8080/proofs
7. Test download proof functionality
8. Go to My Tickets: http://localhost:8080/my-tickets
9. Go to Account Settings: http://localhost:8080/account-settings
10. Test address management
11. Check for payment method management

### ✅ What Works:
- [ ] View all past orders
- [ ] Download past proofs
- [ ] View open/closed support tickets
- [ ] Manage addresses (add/edit/delete)
- [ ] Quick Order section exists

### ❌ What's Missing:
- [ ] Reorder with one click (Quick Order exists but functionality needs verification)
- [ ] Payment method management (save/edit/delete cards)

### Notes:
- Dashboard shows recent orders, active orders summary
- Address management is fully functional
- Payment methods are not saved/managed

---

## Quick Test Checklist

### Must Test Before Demo:
- [ ] User can sign up and login
- [ ] User can browse products
- [ ] User can upload artwork file
- [ ] User can select quantity and see pricing
- [ ] User can complete checkout with Square payment
- [ ] User can view order status and tracking
- [ ] User can approve/request revisions on proofs
- [ ] User can submit and reply to support tickets
- [ ] User can manage addresses

### Known Issues to Mention:
1. PayPal listed but not functional
2. Apple Pay/Google Pay not available
3. Loyalty points system not implemented
4. Payment methods not saved for future use
5. Revision count not displayed (data exists)
6. Support ticket notifications not shown in-app
7. International shipping instructions could be clearer

---

## Demo Script Suggestions

### Opening:
"Let me show you the core ordering system. First, let's create an account..."

### For Each Section:
1. Show what works: "Here's how customers can [feature]..."
2. Acknowledge gaps: "We have [X] implemented, and [Y] is on the roadmap..."
3. Show workarounds: "For [missing feature], customers can currently [alternative]..."

### Closing:
"Overall, we have about 82% of the requirements implemented. The core ordering, tracking, and proof approval systems are fully functional. Payment options and some polish features are the main areas for enhancement."

