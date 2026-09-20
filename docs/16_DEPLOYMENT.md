# 16 - Deployment Plan

This document prepares deployment. Do not perform production deployment until the owner explicitly requests it and supplies/creates production values.

## Production topology
```text
Frontend -> Vercel
Backend  -> Render (Docker)
Database -> Neon PostgreSQL
Images   -> Cloudinary
```

## Production credential rule
Do not reuse development secrets automatically.

Before production:
1. create/choose production Neon database or protected production branch;
2. create production Cloudinary environment/folder strategy;
3. generate a new JWT secret;
4. choose a new admin password;
5. obtain final frontend/backend URLs;
6. configure exact CORS origins;
7. run migrations intentionally;
8. seed only admin/required baseline data, not accidental development demo data unless desired.

## Vercel - frontend
Deploy `front/` as a Vite/React project.

Browser-safe env:
```text
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
VITE_APP_NAME=...
VITE_CURRENCY=BDT
```

Never put database/JWT/Cloudinary secret values in `VITE_*` variables because Vite exposes those variables to the client bundle.

After changing Vercel environment variables, redeploy so build-time Vite values are refreshed.

SPA routes:
Ensure Vercel serves `index.html` for client-side routes where necessary. Configure Vercel rewrite only if its Vite integration does not already handle the app's routing behavior.

## Render - backend
Deploy `back/Dockerfile` as a Docker Web Service.

Render expects the web process to listen on `0.0.0.0` and the assigned `PORT`. Backend startup must honor `PORT`.

Runtime environment variables should include values equivalent to:
```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__Default=...
ConnectionStrings__Migration=...   # optional at runtime; prefer separate migration process if not needed
Jwt__Secret=...
Jwt__Issuer=...
Jwt__Audience=...
Jwt__AccessTokenMinutes=60
Cloudinary__CloudName=...
Cloudinary__ApiKey=...
Cloudinary__ApiSecret=...
Cloudinary__Folder=...
Cors__AllowedOrigins__0=https://YOUR-VERCEL-DOMAIN
Seed__AdminName=...
Seed__AdminEmail=...
Seed__AdminPassword=...
Seed__DemoData=false
```

Do not bake these secrets into Docker build args/layers.

Health check path:
```text
/health/live
```

Use `/health/ready` manually or where dependency-sensitive readiness is desired.

## Neon
Production backend runtime should use pooled Neon connection where appropriate. Migration tooling should use direct connection when configured.

Protect production branch/database. Avoid destructive migration/reset commands.

## Migration deployment procedure
Recommended controlled flow:
1. take/confirm Neon recovery/branching strategy as available;
2. inspect generated migration SQL for destructive changes;
3. run migration against production direct endpoint;
4. verify schema/migrations;
5. deploy/roll backend compatible with new schema;
6. run health/read-only smoke checks.

For this MVP's initial deploy, migration may occur immediately before first backend release.

## CORS deployment sequence
Final Vercel URL may be unknown before first deployment. Safe sequence:
1. deploy backend with temporary exact known preview/prod frontend origin if available;
2. deploy frontend and obtain URL;
3. update backend CORS to exact frontend origin;
4. redeploy backend;
5. test login and authenticated API requests.

Do not permanently use `*` as production CORS shortcut.

## Production smoke test
Run in real browser:
- home/shop load;
- register/login;
- admin login;
- product image loads from Cloudinary;
- add cart;
- checkout COD with a test order;
- admin sees order;
- verify health endpoints;
- verify no secrets in browser bundle/network response;
- verify frontend direct navigation to `/orders` and `/admin` works.

## Post-deploy security cleanup
- ensure development admin password was not reused;
- ensure development Neon credentials are not configured in production;
- ensure source repo contains no `info.txt`;
- ensure Render/Vercel environment scope is correct;
- rotate any secret accidentally exposed during development.
