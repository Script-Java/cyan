# Fly.io Environment Variables

This document lists the environment variables that should be set in Fly.io for the application to run properly.

## Required Environment Variables

Set these using `flyctl secrets set` or via the Fly.io dashboard:

```bash
# Supabase Configuration
flyctl secrets set SUPABASE_URL=your_supabase_url
flyctl secrets set SUPABASE_SERVICE_KEY=your_service_key

# Client-side Supabase (for Vite build)
flyctl secrets set VITE_SUPABASE_URL=your_supabase_url
flyctl secrets set VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Optional Environment Variables

These have defaults but can be overridden:

- `NODE_ENV` - Set to "production" (already set in fly.toml)
- `PORT` - Automatically set by Fly.io (defaults to 3000)
- `PING_MESSAGE` - Custom message for /api/ping endpoint

## Setting Secrets

To set secrets in Fly.io:

```bash
flyctl secrets set KEY=value -a ss1-k4c0dg
```

Or set multiple at once:

```bash
flyctl secrets set \
  SUPABASE_URL=your_url \
  SUPABASE_SERVICE_KEY=your_key \
  VITE_SUPABASE_URL=your_url \
  VITE_SUPABASE_ANON_KEY=your_anon_key \
  -a ss1-k4c0dg
```

## View Current Secrets

```bash
flyctl secrets list -a ss1-k4c0dg
```

## Note

The application will start even without these variables (using placeholder values), but functionality that depends on Supabase will not work correctly. Make sure to set all required variables for full functionality.

