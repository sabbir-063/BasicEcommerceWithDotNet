# 01 - `info.txt` Specification

## Purpose
The root `info.txt` is a development-only bootstrap file supplied by the project owner. It contains real development credentials so Codex can build and test integrations against Neon and Cloudinary.

The application itself must not depend on `info.txt` at runtime. Codex should use its values to create conventional local environment configuration (`front/.env.local`, backend user-secrets or ignored `.env`/environment variables) and to run smoke tests.

## Required values to obtain from external services

### From Neon
Create a development Neon project/database and provide:

```text
NEON_DATABASE_URL_POOLED=...
NEON_DATABASE_URL_DIRECT=...
```

The pooled URL is for normal application runtime. The direct URL is for EF Core migrations/administrative DB operations when a direct connection is more appropriate.

The URLs normally look like PostgreSQL URIs. Npgsql's native connection-string format is semicolon-delimited key/value pairs, so backend startup code or a small configuration helper may normalize a PostgreSQL URI into an Npgsql connection string if required. Do this without logging credentials.

### From Cloudinary
Provide:

```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=ecommerce-dev
```

The API secret must remain backend-only.

### Values generated locally by the owner
Provide a development JWT signing secret and development admin account:

```text
JWT_SECRET=...
DEV_ADMIN_NAME=Development Admin
DEV_ADMIN_EMAIL=...
DEV_ADMIN_PASSWORD=...
```

Use a long random JWT secret. Development admin password may be different from production and must be rotated/replaced before production deployment.

## Values that do not need an external service
These may remain as the defaults from `info.txt.example` unless the owner wants changes:

```text
APP_NAME=BasicCommerce
APP_ENV=development
APP_CURRENCY=BDT
APP_TIMEZONE=Asia/Dhaka
FRONTEND_DEV_URL=http://localhost:5173
BACKEND_DEV_URL=http://localhost:8080
JWT_ISSUER=BasicCommerce.Api
JWT_AUDIENCE=BasicCommerce.Frontend
JWT_ACCESS_TOKEN_MINUTES=60
SEED_DEMO_DATA=true
SEED_DEMO_IMAGE_ASSETS=true
LOG_LEVEL=Information
```

## Values not required yet
Do not require Vercel, Render, custom-domain, or production DB credentials to build the local application.

Before production deployment, request/create a new production set:
- production Neon database/branch credentials;
- production Cloudinary credentials or production folder/environment;
- new production JWT secret;
- production admin password;
- production frontend URL;
- production backend URL;
- optionally Vercel/Render deployment tokens only if automated CLI deployment is explicitly requested.

## Secret-handling protocol for Codex

1. Read `info.txt` silently.
2. Never echo full secrets to terminal output, chat output, screenshots, test reports, or markdown.
3. Never add `info.txt` to Git.
4. Never place secret values in `VITE_*` environment variables.
5. Never bake secrets into frontend JavaScript or Docker images.
6. Prefer runtime environment variables for backend production secrets.
7. Redact connection strings in logs.
8. If a smoke test command would reveal a password in shell history/process args, prefer temporary environment variables or ignored secret files.
9. If credentials appear accidentally in a tracked file, stop and report it; remove them and recommend credential rotation.

## Expected local generated environment files
Codex may generate:

### `front/.env.local`
```text
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=BasicCommerce
VITE_CURRENCY=BDT
```

Only public browser-safe values go here.

### Backend configuration
Use .NET configuration sources. For local development, one of these is acceptable:
- `dotnet user-secrets`;
- ignored `back/.env` loaded only by local tooling;
- shell/Docker Compose environment variables.

Recommended backend variable mapping:

```text
ConnectionStrings__Default=<normalized Neon pooled connection string>
ConnectionStrings__Migration=<normalized Neon direct connection string>
Jwt__Secret=<JWT_SECRET>
Jwt__Issuer=<JWT_ISSUER>
Jwt__Audience=<JWT_AUDIENCE>
Jwt__AccessTokenMinutes=<JWT_ACCESS_TOKEN_MINUTES>
Cloudinary__CloudName=<CLOUDINARY_CLOUD_NAME>
Cloudinary__ApiKey=<CLOUDINARY_API_KEY>
Cloudinary__ApiSecret=<CLOUDINARY_API_SECRET>
Cloudinary__Folder=<CLOUDINARY_FOLDER>
Cors__AllowedOrigins__0=<FRONTEND_DEV_URL>
Seed__AdminName=<DEV_ADMIN_NAME>
Seed__AdminEmail=<DEV_ADMIN_EMAIL>
Seed__AdminPassword=<DEV_ADMIN_PASSWORD>
Seed__DemoData=<SEED_DEMO_DATA>
```

## `info.txt` parser rules
If Codex writes a helper script to read `info.txt`:
- ignore blank lines;
- ignore lines beginning with `#`;
- split on the first `=` only;
- trim key whitespace;
- preserve the rest of the value exactly;
- fail clearly when a required key is missing or placeholder text remains;
- never print secret values in validation output.
