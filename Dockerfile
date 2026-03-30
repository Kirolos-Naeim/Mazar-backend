# Backend Dockerfile for Mazar (NestJS + Prisma)

# =========================
# 1) Builder
# =========================
FROM node:20 AS builder

WORKDIR /app

# Install full deps (incl. dev) so Prisma CLI is available
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy TS config, Nest config, and source
COPY tsconfig.json tsconfig.seed.json nest-cli.json ./
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client (inside the container, matching this OS)
RUN npx prisma generate

# Build NestJS app
RUN npm run build

# Optionally strip dev deps now to shrink what we copy later
RUN npm prune --omit=dev

# =========================
# 2) Runtime
# =========================
FROM node:20-slim AS runtime

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production

# Copy pruned node_modules and Prisma artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose API port
EXPOSE 4000

# Expected env vars at runtime (in Kubernetes / Docker runtime):
# - DATABASE_URL
# - JWT_SECRET
# - CORS_ORIGIN (comma-separated origins)

CMD ["sh", "-c", "npx prisma db push && node dist/prisma/seed.js && node dist/src/main.js"]