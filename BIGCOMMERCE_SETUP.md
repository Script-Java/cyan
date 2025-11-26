# BigCommerce Integration Setup

This document outlines how to set up BigCommerce authentication for the StickerHub ecommerce platform.

## Environment Variables

To enable BigCommerce OAuth authentication, add the following environment variables to your `.env` file:

```env
BIGCOMMERCE_CLIENT_ID=your_bigcommerce_client_id
BIGCOMMERCE_CLIENT_SECRET=your_bigcommerce_client_secret
BIGCOMMERCE_ACCESS_TOKEN=your_bigcommerce_access_token
APP_URL=http://localhost:8080  # or your production URL
```

## Getting BigCommerce Credentials

1. Log in to your BigCommerce store's admin panel
2. Go to **Apps** → **My Apps** → **Create an App**
3. Fill in the app details and request the following OAuth scopes:
   - `store_v2_customers` - For customer management
   - `store_v2_customer_login` - For customer authentication
4. After creation, you'll receive:
   - Client ID
   - Client Secret
   - Access Token (for app-to-store communication)

## OAuth Flow

The application implements a standard OAuth 2.0 flow:

1. **Login/Signup**: User clicks "BigCommerce Account" button
2. **Redirect**: User is redirected to BigCommerce OAuth authorization endpoint
3. **Authorization**: User logs in and authorizes the application
4. **Callback**: BigCommerce redirects back to `/api/auth/bigcommerce/callback` with auth code
5. **Token Exchange**: Backend exchanges auth code for access token
6. **Session Creation**: User session is created and user is logged in

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - Standard email/password login
- `POST /api/auth/signup` - Standard email/password registration
- `GET /api/auth/bigcommerce` - Initiates BigCommerce OAuth flow
- `GET /api/auth/bigcommerce/callback` - Handles OAuth callback
- `GET /api/auth/bigcommerce/signup` - Initiates BigCommerce OAuth for signup
- `POST /api/auth/logout` - Logs out the user

## Implementation Details

The authentication system is located in:

- Frontend: `client/pages/Login.tsx` and `client/pages/Signup.tsx`
- Backend: `server/routes/auth.ts` and `server/index.ts`

### Key Features

1. **Password Validation**: Signup validates password strength
   - At least 8 characters
   - Contains uppercase letter
   - Contains lowercase letter
   - Contains a number

2. **Form Validation**: Email and password fields with icons
3. **Error Handling**: User-friendly error messages
4. **Session Management**: JWT tokens stored in localStorage
5. **BigCommerce Integration**: OAuth authentication method

## Development vs Production

For development, mock authentication endpoints are provided. To connect to actual BigCommerce:

1. Update the API endpoints in `server/routes/auth.ts`
2. Implement the TODO sections for:
   - BigCommerce API calls
   - Customer creation/verification
   - Token exchange
   - Session management

3. Test with your BigCommerce store's sandbox environment first
4. Move to production with proper credentials

## Customer Data Sync

Once authenticated via BigCommerce, the following data should be synced:

- Customer profile (name, email, address)
- Order history
- Wish lists
- Preferences

This synchronization is a TODO item in the implementation.

## Security Considerations

1. **Secrets**: Never commit credentials to version control
2. **HTTPS**: Always use HTTPS in production for OAuth
3. **Token Storage**: Consider using secure cookies instead of localStorage
4. **CORS**: Verify CORS settings match your domain
5. **State Parameter**: OAuth state parameter is used to prevent CSRF attacks

## Support

For BigCommerce API documentation, visit:
https://developer.bigcommerce.com/docs/start

For OAuth flow documentation:
https://developer.bigcommerce.com/docs/integrations/oauth
