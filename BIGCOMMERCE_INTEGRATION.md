# BigCommerce Integration Guide

## Overview

The StickerHub application is fully integrated with BigCommerce for customer management, authentication, and order processing. This guide explains how the integration works and how to use the API endpoints.

## Environment Variables

The following environment variables are required for BigCommerce integration:

```bash
# BigCommerce OAuth Credentials
BIGCOMMERCE_CLIENT_ID=1n0fa2hg486t3q6h3ltq7jxd40cjkwc
BIGCOMMERCE_CLIENT_SECRET=c1fd0d52dcb84cea198732f53693852d73dae88be628dc09ca64d10ac8f05752
BIGCOMMERCE_ACCESS_TOKEN=ej18pwbuoplajolcz1ux5886h3tz0wt
BIGCOMMERCE_STORE_HASH=3uaqwvjjkf

# Application URL for OAuth callback
APP_URL=http://localhost:8080  # or your production URL

# JWT Secret for token generation
JWT_SECRET=your-secure-secret-key
```

## Authentication Flow

### 1. Traditional Email/Password Authentication

**Endpoint:** `POST /api/auth/signup`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": 123,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Account created successfully"
}
```

**Endpoint:** `POST /api/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": 123,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Login successful"
}
```

### 2. BigCommerce OAuth Authentication

**Flow:**

1. User clicks "BigCommerce Account" button
2. Frontend redirects to: `GET /api/auth/bigcommerce`
3. Backend redirects to BigCommerce login: `https://login.bigcommerce.com/oauth2/authorize?...`
4. User logs in with BigCommerce credentials
5. BigCommerce redirects to: `GET /api/auth/bigcommerce/callback?code=...`
6. Backend exchanges code for access token
7. Backend generates JWT token and redirects to: `/auth/callback?auth_token=...&customer_id=...`
8. Frontend stores token in localStorage and redirects to home

**Scopes:**
- `store_v2_customers` - Customer management
- `store_v2_orders` - Order management

## API Endpoints

All endpoints except authentication require the JWT token in the Authorization header:

```bash
Authorization: Bearer <JWT_TOKEN>
```

### Authentication Endpoints (No Auth Required)

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

#### BigCommerce OAuth Initiate
```
GET /api/auth/bigcommerce
```
Redirects to BigCommerce login page.

#### BigCommerce OAuth Callback
```
GET /api/auth/bigcommerce/callback?code=<AUTH_CODE>
```
Internal endpoint for BigCommerce to redirect back to. Automatically redirects to `/auth/callback` with token.

#### Logout
```
POST /api/auth/logout
```

### Customer Endpoints (Protected)

#### Get Current Customer Profile
```
GET /api/customers/me
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "success": true,
  "customer": {
    "id": 123,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "companyName": "ACME Corp",
    "addresses": [...]
  }
}
```

#### Update Customer Profile
```
PATCH /api/customers/me
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+9876543210"
}
```

#### Get Customer Addresses
```
GET /api/customers/me/addresses
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "success": true,
  "addresses": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "street_1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "US"
    }
  ]
}
```

### Order Endpoints (Protected)

#### Get Customer Orders
```
GET /api/orders
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "success": true,
  "orders": [
    {
      "id": 101,
      "customerId": 123,
      "status": "completed",
      "dateCreated": "2024-01-15T10:30:00Z",
      "total": 49.99,
      "itemCount": 2
    }
  ],
  "count": 1
}
```

#### Get Single Order
```
GET /api/orders/:orderId
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "success": true,
  "order": {
    "id": 101,
    "customerId": 123,
    "status": "completed",
    "dateCreated": "2024-01-15T10:30:00Z",
    "total": 49.99,
    "subtotal": 40.00,
    "tax": 9.99,
    "items": [...],
    "shippingAddress": {...},
    "billingAddress": {...}
  }
}
```

#### Create Order
```
POST /api/orders
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "customFields": [
        {
          "name": "Design URL",
          "value": "https://example.com/design.png"
        }
      ]
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street_1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 102,
    "customerId": 123,
    "status": "pending",
    "total": 49.99,
    "dateCreated": "2024-01-20T14:00:00Z"
  }
}
```

## Frontend Integration

### Storing Authentication Token

After successful login/signup, the token is stored in localStorage:

```javascript
localStorage.setItem("authToken", token);
localStorage.setItem("customerId", customerId);
```

### Using the Token in API Calls

```javascript
const token = localStorage.getItem("authToken");

const response = await fetch("/api/customers/me", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

### Header Authentication State

The Header component automatically detects login status and updates UI:

```typescript
useEffect(() => {
  const token = localStorage.getItem("authToken");
  setIsAuthenticated(!!token);
}, []);
```

### Logout

```javascript
const handleLogout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("customerId");
  navigate("/");
};
```

## Backend Services

### BigCommerce API Utility (`server/utils/bigcommerce.ts`)

Provides methods for:
- `exchangeCodeForToken()` - OAuth token exchange
- `createCustomer()` - Create new customer
- `getCustomerByEmail()` - Find customer by email
- `getCustomer()` - Get customer details
- `getCustomerOrders()` - Fetch customer orders
- `createOrder()` - Create new order
- `getOrder()` - Get order details
- `updateCustomerPassword()` - Update password
- `validateCredentials()` - Validate email/password

### Authentication Middleware (`server/middleware/auth.ts`)

- `verifyToken()` - Required authentication middleware
- `optionalVerifyToken()` - Optional authentication middleware

Extracts JWT token from Authorization header and sets `req.customerId` and `req.email`.

## API Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Email and password required"
}
```

#### 401 Unauthorized
```json
{
  "error": "Invalid email or password"
}
```

#### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

#### 500 Server Error
```json
{
  "error": "Login failed"
}
```

## Security Considerations

1. **JWT Tokens:**
   - Tokens expire after 30 days
   - Signed with `JWT_SECRET` environment variable
   - Must be stored securely (avoid localStorage in production, consider httpOnly cookies)

2. **OAuth State Parameter:**
   - Prevents CSRF attacks during OAuth flow
   - Generated randomly for each authorization request

3. **Password Validation:**
   - Minimum 8 characters
   - Must contain uppercase, lowercase, and number
   - Validated client-side and server-side

4. **HTTPS:**
   - All API calls must use HTTPS in production
   - OAuth flow requires HTTPS for security

5. **Environment Variables:**
   - Store credentials in environment variables, never in code
   - Rotate credentials periodically
   - Use strong JWT_SECRET

## Testing

### Manual Testing

1. **Test Signup:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"SecurePassword123"}'
   ```

2. **Test Login:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"SecurePassword123"}'
   ```

3. **Test Protected Endpoint:**
   ```bash
   curl -X GET http://localhost:8080/api/customers/me \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

## Troubleshooting

### BigCommerce OAuth Fails
- Check that `APP_URL` matches your redirect URI in BigCommerce settings
- Verify Client ID and Client Secret are correct
- Check that OAuth scopes are properly configured

### Token Validation Fails
- Verify `JWT_SECRET` matches between signup/login and API calls
- Check token hasn't expired (30 days)
- Ensure Authorization header format is correct: `Bearer <TOKEN>`

### Customer Not Found
- Verify customer exists in BigCommerce store
- Check that store hash is correct

### Order Creation Fails
- Verify product IDs exist in BigCommerce
- Check shipping and billing addresses are complete
- Ensure items array is not empty

## Production Deployment

1. Update environment variables with production values
2. Change `JWT_SECRET` to a secure random value
3. Set `APP_URL` to your production domain
4. Use HTTPS for all connections
5. Consider using httpOnly cookies instead of localStorage for tokens
6. Implement rate limiting on auth endpoints
7. Add CORS configuration for production domain
8. Monitor BigCommerce API rate limits
9. Set up error logging and monitoring

## Support Resources

- BigCommerce API Docs: https://developer.bigcommerce.com/docs
- OAuth 2.0 Documentation: https://developer.bigcommerce.com/docs/integrations/oauth
- BigCommerce Store Credentials: https://support.bigcommerce.com/s/article/Store-API-Accounts

## Notes

- The integration uses BigCommerce's REST API v3
- All API responses follow the standard JSON format
- Timestamps are in ISO 8601 format
- Prices are in store currency as configured in BigCommerce
