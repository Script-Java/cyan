# Fly.io Environment Variables (DEPRECATED)

⚠️ **This file is deprecated.** The application has been migrated to Netlify and no longer uses Fly.io for deployment.

For current deployment instructions, see `DEPLOYMENT_CHECKLIST.md` and deploy to Netlify instead.

The information below is kept for reference only and should not be used.

---

# Legacy Fly.io Configuration (Do Not Use)

This document listed environment variables for the Fly.io deployment platform.

## Required Environment Variables (Legacy)

```bash
# Supabase Configuration
flyctl secrets set SUPABASE_URL=your_supabase_url
flyctl secrets set SUPABASE_SERVICE_KEY=your_service_key

# Client-side Supabase (for Vite build)
flyctl secrets set VITE_SUPABASE_URL=your_supabase_url
flyctl secrets set VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Migration to Netlify

To deploy to Netlify instead:

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify Dashboard → Site Settings → Build & Deploy → Environment
3. Deploy using the Netlify UI

See `DEPLOYMENT_CHECKLIST.md` for full instructions.
