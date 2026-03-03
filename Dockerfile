# Backend Dockerfile for mvp-delivery (NestJS + Prisma)

# =========================
# 1) Builder
# =========================
FROM node:20 AS builder

WORKDIR /app

# Install build deps
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY tsconfig.json tsconfig.seed.json nest-cli.json ./
COPY src ./src
COPY prisma ./prisma

# Generate prisma client & build
RUN npx prisma generate
RUN npm run build

# =========================
# 2) Runtime
# =========================
FROM node:20

WORKDIR /app

ENV NODE_ENV=production
# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy prisma schema and generate client in this stage
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Expose API port
EXPOSE 4000

# Expected env vars at runtime:
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mvp_delivery?schema=public"
ENV JWT_SECRET="dev-secret"
# - DATABASE_URL
# - JWT_SECRET
# - CORS_ORIGIN (comma-separated origins)

CMD ["node", "dist/src/main.js"]
