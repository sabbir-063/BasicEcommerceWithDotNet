# 16 - Render Deployment

Deploy the repository as two free Render Docker Web Services backed by the existing Neon PostgreSQL database and Cloudinary account.

## Backend

```text
Root Directory: back
Dockerfile Path: ./Dockerfile
Docker Build Context: .
Health Check Path: /health/live
```

Required environment variables:

```text
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__Default=<complete Npgsql connection string>
Jwt__Secret=...
Jwt__Issuer=BasicCommerce.Api
Jwt__Audience=BasicCommerce.Frontend
Jwt__AccessTokenMinutes=60
Cloudinary__CloudName=...
Cloudinary__ApiKey=...
Cloudinary__ApiSecret=...
Cloudinary__Folder=...
Cors__AllowedOrigins__0=https://YOUR-FRONTEND-SERVICE.onrender.com
```

The same variable accepts multiple comma-separated origins when both a Render URL and a custom domain are needed:

```text
Cors__AllowedOrigins__0=https://YOUR-FRONTEND.onrender.com,https://YOUR-CUSTOM-DOMAIN.com
```

Do not configure `PORT`; Render provides it. Production startup applies migrations but does not seed data.

## Frontend

```text
Root Directory: front
Dockerfile Path: ./Dockerfile
Docker Build Context: .
Health Check Path: /
```

Frontend environment:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND-SERVICE.onrender.com/api
```

Deploy the backend first. Deploy the frontend with the resulting backend URL, then update backend CORS with the exact frontend URL and redeploy the backend.

## Verification

- `https://YOUR-BACKEND/health/live` returns success.
- `https://YOUR-BACKEND/health/ready` can connect to PostgreSQL.
- Direct frontend navigation to `/orders` and `/admin` returns the SPA.
- Registration, login, existing products, cart, checkout, admin access, and Cloudinary image upload work.
