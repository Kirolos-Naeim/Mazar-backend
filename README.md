# Mazar Backend (NestJS + Prisma)

## Overview

This is the backend service for the Mazar MVP. It is a NestJS application using Prisma and PostgreSQL.

- Tech stack: NestJS, TypeScript, Prisma, PostgreSQL
- Port: `4000`
- Docker image (current): `keroles149/mazar_backend:<tag>`

---

## Local development

```bash
cd Mazar-backend
npm ci
npm run prisma:generate
npm run start:dev
```

You need a PostgreSQL instance and a `DATABASE_URL` pointing to it, for example:

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mvp_delivery?schema=public"
export JWT_SECRET="dev-secret"
export CORS_ORIGIN="http://localhost:3000"
```

---

## Docker build

The Dockerfile is multi-stage (builder + runtime) and **does not** hardcode secrets. All sensitive values are provided at runtime via env vars.

Build a local image:

```bash
docker build -t keroles149/mazar_backend:local .
```

Run it (example):

```bash
docker run --rm -p 4000:4000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/mvp_delivery?schema=public" \
  -e JWT_SECRET="dev-secret" \
  -e CORS_ORIGIN="http://localhost:3000" \
  keroles149/mazar_backend:local
```

> In Kubernetes, `DATABASE_URL` and `JWT_SECRET` are injected from the `db-secret` Secret, and `CORS_ORIGIN` is configured in the `backend-deployment.yaml`.

---

## CI/CD suggestions

Typical pipeline steps:

1. Install deps & test
   ```bash
   npm ci
   npm run build
   npm test
   ```

2. Build & push image
   ```bash
   docker build -t keroles149/mazar_backend:${GIT_SHA_OR_VERSION} .
   docker push keroles149/mazar_backend:${GIT_SHA_OR_VERSION}
   ```

3. Update `mvp-delivery/k8s/backend-deployment.yaml` image tag and apply:
   ```bash
   kubectl apply -f mvp-delivery/k8s/
   ```

---

## Environment variables

At runtime the service expects:

- `DATABASE_URL` – Prisma connection string
- `JWT_SECRET` – secret key for JWT
- `CORS_ORIGIN` – comma-separated list of allowed origins

These are **not** baked into the image; they must come from Kubernetes (Secrets/ConfigMaps) or container runtime env.
