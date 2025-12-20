# Ecwid Webhook Setup and Integration Guide

This document explains how to set up and verify Ecwid webhooks for real-time order and customer synchronization.

## Overview

The application supports receiving real-time events from Ecwid through webhooks, including:
- **order.completed** - When an order is placed and completed
- **order.updated** - When an order status changes (shipping, tracking updates)
- **customer.created** - When a new customer is created in Ecwid
- **customer.updated** - When customer information is updated

## Architecture

### Webhook Flow
1. Customer places order in Ecwid
2. Ecwid sends webhook notification to `/api/webhooks/ecwid`
3. Application receives and validates the webhook signature
4. Order/customer data is stored in Supabase database
5. Data syncs automatically to the store

### Files Involved
- **Server Route**: `server/routes/webhooks.ts` - Webhook handlers and validation
- **Database**: Supabase tables `orders` and `customers` with Ecwid ID fields
- **Admin Page**: `client/pages/AdminEcwidMigration.tsx` - Setup verification and instructions

## Setup Instructions

### Step 1: Verify Your Configuration

1. Navigate to the Ecwid Migration admin page
2. Look for the "Live Order Reception (Webhooks)" section
3. Check the API Connectivity status - it should show "Connected"
4. Copy your Webhook URL from the displayed field

### Step 2: Configure Webhook in Ecwid Admin Panel

1. Log in to your Ecwid store admin panel (https://my.ecwid.com)
2. Go to **Settings → Apps & Integrations → My Apps** (or **Settings → API → Webhooks** in older versions)
3. Look for "Create Integration" or "Add Webhook" button
4. Paste the webhook URL from Step 1 into the URL field
5. Select the following events to listen for:
   - ✅ order.completed
   - ✅ order.updated
   - ✅ customer.created
   - ✅ customer.updated
6. Save the integration

### Step 3: Test the Webhook (Optional)

Use the test endpoint to verify webhook processing:

```bash
curl -X POST http://localhost:3000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "eventType": "order.completed",
    "data": {
      "orderId": 12345,
      "customerId": 67890,
      "email": "customer@example.com",
      "total": 99.99,
      "subtotal": 89.99,
      "tax": 10.00,
      "shipping": 0,
      "items": [],
      "billingPerson": {},
      "shippingPerson": {}
    }
  }'
```

## Webhook Payload Examples

### Order Completed Webhook

```json
{
  "eventType": "order.completed",
  "data": {
    "orderId": 12345,
    "customerId": 67890,
    "email": "customer@example.com",
    "total": 99.99,
    "subtotal": 89.99,
    "tax": 10.00,
    "shipping": 0,
    "status": "AWAITING_PROCESSING",
    "items": [
      {
        "productId": 111,
        "quantity": 1,
        "price": 89.99
      }
    ],
    "billingPerson": {
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "email": "customer@example.com",
      "phone": "+1234567890"
    },
    "shippingPerson": {
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "postalCode": "12345",
      "country": "US"
    },
    "createDate": "2024-01-15T10:30:00Z"
  }
}
```

### Order Updated Webhook

```json
{
  "eventType": "order.updated",
  "data": {
    "orderId": 12345,
    "fulfillmentStatus": "SHIPPED",
    "trackingNumber": "1Z999AA10123456784",
    "trackingCarrier": "UPS",
    "trackingUrl": "https://tracking.ups.com/...",
    "estimatedDeliveryDate": "2024-01-20T00:00:00Z"
  }
}
```

### Customer Created Webhook

```json
{
  "eventType": "customer.created",
  "data": {
    "id": 67890,
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "companyName": "Acme Inc",
    "createdDate": "2024-01-15T10:30:00Z"
  }
}
```

## Database Schema

### Orders Table Fields Used
- `id` - Primary key (auto-increment)
- `ecwid_order_id` - Ecwid order ID (used to link webhook data)
- `ecwid_customer_id` - Ecwid customer ID
- `customer_id` - Link to local customers table
- `status` - Order status (pending, processing, shipped, completed, etc.)
- `total` - Order total amount
- `subtotal` - Order subtotal
- `tax` - Tax amount
- `shipping` - Shipping cost
- `billing_address` - JSONB with billing information
- `shipping_address` - JSONB with shipping information
- `tracking_number` - Shipping tracking number
- `tracking_carrier` - Carrier name (UPS, FedEx, etc.)
- `tracking_url` - Tracking URL
- `estimated_delivery_date` - Estimated delivery date
- `created_at` - Order creation timestamp
- `updated_at` - Last update timestamp

### Customers Table Fields Used
- `id` - Primary key (auto-increment)
- `ecwid_customer_id` - Ecwid customer ID (used to link webhook data)
- `email` - Customer email
- `first_name` - Customer first name
- `last_name` - Customer last name
- `phone` - Customer phone
- `company` - Company name
- `created_at` - Customer creation timestamp
- `updated_at` - Last update timestamp

## Security

### Webhook Signature Verification
The application verifies each webhook signature using HMAC-SHA256:

```typescript
const secret = process.env.ECWID_API_TOKEN;
const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
const isValid = hash === signatureFromHeader;
```

- Only webhooks with valid signatures are processed
- Invalid signatures are rejected with HTTP 401
- The signature uses your Ecwid API token as the secret key

## Troubleshooting

### "API Connectivity: Error"
- **Cause**: Invalid or missing ECWID_API_TOKEN or ECWID_STORE_ID
- **Solution**: 
  1. Verify environment variables are set correctly
  2. Check token hasn't expired in Ecwid admin panel
  3. Ensure store ID is correct

### "Webhook not receiving orders"
- **Common Causes**:
  1. Webhook URL not configured in Ecwid admin panel
  2. Ecwid events not selected (order.completed, order.updated, etc.)
  3. Webhook endpoint not accessible from internet
  4. Firewall/network blocking webhooks
  
- **Debug Steps**:
  1. Verify webhook URL is correct and accessible
  2. Check that selected events match in Ecwid settings
  3. Review server logs for webhook requests
  4. Test with the test endpoint: `POST /api/webhooks/test`

### "Orders created but not syncing to Supabase"
- **Cause**: Supabase connection issue
- **Solution**:
  1. Verify SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
  2. Check that orders table exists and has ecwid_order_id column
  3. Verify table permissions and RLS policies if enabled

### "Customer data not syncing"
- **Cause**: Missing customer records or email mismatch
- **Solution**:
  1. Ensure customer.created event is selected in Ecwid webhooks
  2. Check customer email is unique in database
  3. Verify no RLS policies blocking customer inserts

## Diagnostic Endpoints

### Get Webhook URL
**Endpoint**: `GET /api/webhooks/url`

Returns the webhook URL that should be configured in Ecwid:
```bash
curl http://localhost:3000/api/webhooks/url
```

### Webhook Health Check
**Endpoint**: `GET /api/webhooks/health`

Simple health check endpoint:
```bash
curl http://localhost:3000/api/webhooks/health
```

### Full Diagnostics (Admin)
**Endpoint**: `GET /api/webhooks/diagnostic` (requires authentication)

Returns full diagnostic information including:
- API connectivity status
- Webhook URL
- Setup instructions
- Recent orders from Ecwid
- Supabase connection status

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/webhooks/diagnostic
```

## Best Practices

1. **Test Before Deploying**: Use the test endpoint to verify webhook processing before going live
2. **Monitor Logs**: Check application logs for webhook processing errors
3. **Handle Duplicates**: The system uses ecwid_order_id to prevent duplicate orders
4. **Backup Data**: Keep backups of critical order data
5. **Update Tracking**: Configure order.updated events to sync tracking information
6. **Error Recovery**: Failed webhooks are logged; you can manually sync using the migration endpoint

## Production Deployment

When deploying to production:

1. Ensure your webhook URL is publicly accessible (HTTPS required)
2. Set environment variables in production (not in .env file)
3. Configure Ecwid webhooks to point to production URL
4. Test with a real order in Ecwid to verify end-to-end flow
5. Monitor logs for any webhook processing errors
6. Set up alerts for webhook failures

## Integration with Customer Accounts

When a customer who previously ordered from Ecwid signs up with the same email:

1. They can create an account with their Ecwid email
2. Their historical orders automatically appear in their account
3. New orders are linked to their customer record
4. They can view order history and tracking information

## Support

If you encounter issues with webhook setup:

1. Check this guide's troubleshooting section
2. Review server logs for error messages
3. Verify configuration in both application and Ecwid admin panel
4. Test with the diagnostic and test endpoints
5. Ensure network connectivity to Ecwid API
