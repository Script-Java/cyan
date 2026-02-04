-- MIGRATION: Create public access tokens table for secure public endpoints
-- 
-- PURPOSE:
-- Replace guessable ID-based public access with cryptographically secure tokens
-- Support token expiration and one-time use for additional security
-- 
-- SECURITY PROPERTIES:
-- - Tokens are 64 hex characters (32 random bytes)
-- - Resource-type and resource-id locked (token for proof can't access order)
-- - Atomic validation (token lookup + resource verification together)
-- - Generic 404 responses prevent enumeration attacks
-- - Tokens never leaked after generation

-- Create the public_access_tokens table
CREATE TABLE IF NOT EXISTS public_access_tokens (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  
  -- Resource identification
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('proof', 'order', 'invoice', 'design')),
  resource_id VARCHAR(255) NOT NULL,
  
  -- Expiration and usage
  expires_at TIMESTAMPTZ NOT NULL,
  one_time_use BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  
  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(255),
  metadata JSONB,
  
  -- Constraints
  CONSTRAINT token_not_too_long CHECK (LENGTH(token) = 64),
  CONSTRAINT token_hex_format CHECK (token ~ '^[0-9a-f]{64}$')
);

-- INDEXES
-- Primary lookup index: token (only unused tokens)
CREATE INDEX idx_public_access_tokens_token 
  ON public_access_tokens(token) 
  WHERE used_at IS NULL;

-- Secondary lookup: by resource type and ID
CREATE INDEX idx_public_access_tokens_resource 
  ON public_access_tokens(resource_type, resource_id);

-- Maintenance index: for cleanup of expired tokens
CREATE INDEX idx_public_access_tokens_expires 
  ON public_access_tokens(expires_at) 
  WHERE used_at IS NULL;

-- COMMENTS
COMMENT ON TABLE public_access_tokens IS 'Cryptographically secure access tokens for public endpoints. Replaces guessable ID-based access.';
COMMENT ON COLUMN public_access_tokens.token IS 'Unique 64-character hex token (32 random bytes). Never exposed after creation.';
COMMENT ON COLUMN public_access_tokens.resource_type IS 'Type of resource (proof, order, invoice, design). Tokens are type-locked.';
COMMENT ON COLUMN public_access_tokens.resource_id IS 'ID of the specific resource this token grants access to.';
COMMENT ON COLUMN public_access_tokens.expires_at IS 'Timestamp when token expires. Default 48 hours.';
COMMENT ON COLUMN public_access_tokens.one_time_use IS 'If true, token is invalidated after first successful use.';
COMMENT ON COLUMN public_access_tokens.used_at IS 'Timestamp of first (and only, if one-time) successful use.';
COMMENT ON COLUMN public_access_tokens.created_by IS 'Email or identifier of who created this token (for audit).';
COMMENT ON COLUMN public_access_tokens.metadata IS 'Additional metadata (e.g., customer_id, order_number for audit trails).';

-- PERMISSIONS
-- Anon and authenticated users cannot directly query this table
-- Access is controlled via API endpoints only
REVOKE ALL ON public_access_tokens FROM anon, authenticated;
GRANT USAGE ON SEQUENCE public_access_tokens_id_seq TO anon, authenticated;

-- Optional: Add sequence grant if needed
GRANT SELECT ON public_access_tokens_id_seq TO anon, authenticated;
