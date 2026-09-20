# 10 - Docker and Local Development

## Goals
- Frontend has a valid production-style Docker image.
- Backend has a valid production-style Docker image.
- Root Docker Compose can run frontend + backend locally.
- Neon remains the development database service; a permanent local PostgreSQL container is not required.
- Automated integration tests may use disposable PostgreSQL Testcontainers.

## Backend Dockerfile
Use multi-stage build:
1. .NET 10 SDK image for restore/build/publish;
2. ASP.NET 10 runtime image;
3. non-root user where practical;
4. expose/document app port;
5. runtime reads Render `PORT` and binds to `0.0.0.0`.

Application startup should handle:
- when `PORT` exists: bind `http://0.0.0.0:${PORT}`;
- otherwise local container default `8080`.

Do not embed secrets in Dockerfile.

## Frontend Dockerfile
Use multi-stage build:
1. Node 24 LTS image;
2. install with lockfile (`npm ci` if npm chosen);
3. run typecheck/build;
4. copy `dist/` into Nginx/alpine or equivalent static server;
5. include SPA fallback so `/orders/...` routes return `index.html` instead of 404.

Frontend Docker image is for container validation/local hosting. Vercel production deployment can build directly from the `front` source directory.

## Root `docker-compose.yml`
Suggested services:

```text
frontend
backend
```

`backend` receives runtime env values from ignored configuration or shell. `frontend` build receives only browser-safe API URL values.

For a Docker-to-Docker local setup:
- Browser must call a host-accessible backend URL, not an internal-only Docker hostname.
- Example frontend API base: `http://localhost:8080/api`.

## Local development without Docker
Recommended fast inner loop:

Backend:
```bash
cd back
dotnet restore
dotnet ef database update --project src/BasicCommerce.Infrastructure --startup-project src/BasicCommerce.Api
dotnet run --project src/BasicCommerce.Api
```

Frontend:
```bash
cd front
npm ci
npm run dev
```

Exact EF command paths may vary with final project names; document final commands in root README.

## Local development with Docker
Codex should create a documented command such as:
```bash
docker compose up --build
```

Expected:
- frontend: `http://localhost:5173` or documented mapped static port;
- backend: `http://localhost:8080`;
- health: `http://localhost:8080/health/live`.

Choose stable port mapping and keep docs accurate.

## Environment validation
On backend startup, fail fast with a clear non-secret message when required production/development config is absent, such as:
- DB connection missing;
- JWT secret missing/too short;
- Cloudinary credentials missing when image upload feature is enabled.

Do not print values.

## Neon migrations
Use direct Neon URL for migration workflow if configured.
Use pooled Neon URL for normal application runtime.

Do not run destructive reset/migration commands against an unknown database. Codex must verify `APP_ENV=development` before any optional reset/seed procedure.

## Seed execution
Development seed must be idempotent:
- admin inserted only if email absent;
- categories/products not duplicated;
- demo image seeding does not re-upload the same images on every restart.

Prefer explicit `--seed` command or Development-only startup seeder that checks for existing records.
