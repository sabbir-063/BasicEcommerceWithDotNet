# BasicCommerce

BasicCommerce is a React/Vite storefront with an ASP.NET Core API, PostgreSQL, Cloudinary image storage, JWT authentication, customer/admin roles, and Cash on Delivery checkout.

## Project structure

- `front/` — React, TypeScript, Vite, and the frontend Docker image
- `back/` — ASP.NET Core API, EF Core migrations, and the backend Docker image
- `docs/` — architecture, API, testing, and deployment notes

Production deployment uses two independent Render Docker Web Services. Docker Compose, Nginx, Vercel configuration, and a local database container are not required.

## Local development

Backend:

```powershell
$env:ConnectionStrings__Default="Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require"
$env:Jwt__Secret="..."
dotnet run --project back/src/BasicCommerce.Api
```

The local backend URL is `http://localhost:5284`.

Frontend:

```powershell
cd front
npm ci
npm run dev
```

The local frontend URL is `http://localhost:5173`. It calls `http://localhost:5284/api` unless `VITE_API_BASE_URL` overrides it.

## Render deployment

### Backend service

Create a Render Web Service with:

```text
Language: Docker
Root Directory: back
Dockerfile Path: ./Dockerfile
Docker Build Context: .
Health Check Path: /health/live
```

Set these environment variables:

```env
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__Default=Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require
Jwt__Secret=...
Jwt__Issuer=BasicCommerce.Api
Jwt__Audience=BasicCommerce.Frontend
Jwt__AccessTokenMinutes=60
Cloudinary__CloudName=...
Cloudinary__ApiKey=...
Cloudinary__ApiSecret=...
Cloudinary__Folder=ecommerce-dev
Cors__AllowedOrigins__0=https://YOUR-FRONTEND-SERVICE.onrender.com
```

`ConnectionStrings__Default` is one environment variable containing the complete database connection string. Separate host, database, username, and password variables are not needed. Use an Npgsql/ADO.NET connection string, not a raw `postgresql://` URI.

Render supplies `PORT`; do not configure it manually. In Production the API applies existing EF Core migrations and does not seed an admin, categories, or products.

### Frontend service

After the backend URL is available, create a second Render Web Service with:

```text
Language: Docker
Root Directory: front
Dockerfile Path: ./Dockerfile
Docker Build Context: .
Health Check Path: /
```


Set one environment variable:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-SERVICE.onrender.com/api
```

This is a public build-time value. Never add database, JWT, Cloudinary secret, or admin credentials to the frontend service.

After the frontend URL is final, set that exact origin in the backend's `Cors__AllowedOrigins__0` and redeploy the backend.

## Database and production behavior

- The application uses the external PostgreSQL database configured by `ConnectionStrings__Default`.
- Production startup applies migrations but does not create seed records.
- Existing users, products, carts, and orders remain in the database.
- Product images are stored in Cloudinary, not in the container filesystem.
- Render's filesystem can therefore remain ephemeral.

## Secrets

Never commit `info.txt`, `.env` files, database credentials, JWT secrets, Cloudinary API secrets, or admin passwords. `info.txt` is only a local reference for configuring Render.
