# 22 - Production Value Rotation Checklist

Use this only when the owner says the application is ready to deploy.

## Never assume development values are production values
Create or confirm a fresh production configuration set.

## Required production values

### App URLs
```text
PROD_FRONTEND_URL=https://...
PROD_BACKEND_URL=https://...
```

The Render URL may exist before the Vercel URL. Update CORS after both are known.

### JWT
```text
JWT_SECRET=<new production random secret>
JWT_ISSUER=BasicCommerce.Api
JWT_AUDIENCE=BasicCommerce.Frontend
JWT_ACCESS_TOKEN_MINUTES=60
```

Generate a new secret, not the development secret.

### Admin
```text
PROD_ADMIN_NAME=...
PROD_ADMIN_EMAIL=...
PROD_ADMIN_PASSWORD=<new strong password>
```

### Neon production
```text
NEON_DATABASE_URL_POOLED=<production pooled URI>
NEON_DATABASE_URL_DIRECT=<production direct URI>
```

Use a production database/branch appropriate for live data.

### Cloudinary production
At minimum:
```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=ecommerce-prod
```

If the same Cloudinary product environment is used, use a separate production folder and deliberate credentials/permissions. Prefer environment separation when the account plan/workflow supports it.

## Optional deployment automation credentials
Only request these if Codex is explicitly asked to deploy via CLI/API instead of the owner connecting Git in dashboards:
```text
VERCEL_TOKEN=...
RENDER_API_KEY=...
```

Do not request deployment tokens merely to generate deployment-ready code.

## Final pre-deploy checks
- [ ] production secrets not committed;
- [ ] Vercel contains only browser-safe variables;
- [ ] Render contains backend secrets;
- [ ] CORS exact frontend origin;
- [ ] production migration reviewed;
- [ ] demo seed decision explicitly confirmed;
- [ ] admin seeded securely;
- [ ] health check configured;
- [ ] HTTPS URLs;
- [ ] production browser smoke test plan ready.
