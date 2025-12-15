# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
# Note: VITE_* env vars are replaced at build time, but we provide defaults to prevent errors
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN pnpm build || (echo "❌ Build failed" && exit 1)

# Verify build output exists
RUN echo "=== Build verification ===" && \
    echo "Contents of /app:" && \
    ls -la /app/ | head -20 && \
    echo "Contents of dist:" && \
    ls -la dist/ && \
    echo "Contents of dist/server:" && \
    (ls -la dist/server/ || echo "dist/server directory does not exist") && \
    echo "Contents of dist/spa:" && \
    (ls -la dist/spa/ | head -10 || echo "dist/spa directory does not exist") && \
    echo "=== Checking for production.mjs ===" && \
    (test -f dist/server/production.mjs && echo "✅ production.mjs found at dist/server/production.mjs" || (echo "❌ production.mjs NOT FOUND" && find dist -name "*.mjs" -o -name "*.js" | head -10)) && \
    echo "=== Build verification complete ==="

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Verify files were copied
RUN echo "=== Verifying copied files ===" && \
    ls -la dist/ && \
    ls -la dist/server/ 2>/dev/null || echo "dist/server not found" && \
    test -f dist/server/production.mjs && echo "✅ production.mjs found" || echo "❌ production.mjs NOT FOUND" && \
    ls -la dist/spa/ 2>/dev/null || echo "dist/spa not found"

# Expose port (fly.io will set PORT env var)
EXPOSE 3000

# Start the server
CMD ["node", "dist/server/production.mjs"]

