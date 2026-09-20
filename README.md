# BasicCommerce

BasicCommerce is a full-stack, single-store e-commerce MVP with a React/Vite frontend, ASP.NET Core API, PostgreSQL cart/order persistence, Cloudinary-backed product images, JWT authentication, customer/admin roles, and Cash on Delivery checkout.

## Repository

- `front/` — React, TypeScript, Vite, responsive customer/admin UI, Vitest and Playwright
- `back/` — layered ASP.NET Core solution, EF Core/Npgsql, JWT, Cloudinary, xUnit
- `docs/` — product, architecture, security, testing, and deployment specifications
- `docker-compose.yml` — local frontend/backend container orchestration

The local host currently has .NET 9 and Node 22 installed, so the verified local project targets `net9.0`; the code and Docker structure are ready to move to the documented .NET 10/Node 24 baseline when those toolchains are installed.

## Configuration

Never commit `info.txt`, `back/.env`, `.env.local`, JWT secrets, database credentials, admin passwords, or Cloudinary API secrets.

Copy `back/.env.example` to `back/.env` and supply development values. The frontend only needs browser-safe values:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=BasicCommerce
VITE_CURRENCY=BDT
```

Required backend variables are documented in `back/.env.example`. Neon PostgreSQL URI values must be converted to an Npgsql key/value connection string when necessary.

## Local development

Backend:

```powershell
dotnet restore back/BasicCommerce.sln --configfile back/NuGet.Config
dotnet build back/BasicCommerce.sln
dotnet test back/BasicCommerce.sln
dotnet run --project back/src/BasicCommerce.Api
```

Frontend:

```powershell
cd front
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm run dev
```

Default development URLs are frontend `http://localhost:5173`, API `http://localhost:5284` when using the checked-in launch profile, Swagger `http://localhost:5284/swagger`, liveness `/health/live`, and database readiness `/health/ready`.

## Database migrations

The initial migration is under `back/src/BasicCommerce.Infrastructure/Migrations`.

```powershell
dotnet tool restore
$env:ConnectionStrings__Migration="Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require"
dotnet tool run dotnet-ef database update --project back/src/BasicCommerce.Infrastructure --startup-project back/src/BasicCommerce.Api
```

Use a disposable PostgreSQL database for automated destructive/reset tests. Never point test reset commands at the provided development Neon database.

## Browser tests

Start the API and frontend, then provide the development admin values only as process environment variables:

```powershell
cd front
$env:E2E_ADMIN_EMAIL="..."
$env:E2E_ADMIN_PASSWORD="..."
npm run e2e
```

The core suite covers catalog search, registration/login, PostgreSQL cart persistence through refresh, COD checkout, order history/details, and admin authorization/navigation.

## Docker

Create ignored `back/.env` from the example, then:

```powershell
docker compose build
docker compose up
```

The frontend image serves the Vite SPA with Nginx; the backend image exposes port 8080. Backend secrets are injected at runtime and are not build arguments or image layers.

## Deployment readiness

- Vercel: deploy `front/`, set only `VITE_API_BASE_URL`, `VITE_APP_NAME`, and `VITE_CURRENCY`; `vercel.json` provides SPA fallback.
- Render: deploy `back/Dockerfile`, set `PORT` plus the backend environment values, and use `/health/live` as the health path.
- Neon: use pooled runtime and direct migration connections as appropriate.
- Cloudinary: keep the API secret backend-only and use a separate production folder/environment.

Production deployment has intentionally not been performed. Before deployment, supply fresh production Neon, Cloudinary, JWT, admin, and final frontend/backend URL values as listed in `docs/22_PRODUCTION_VALUE_ROTATION.md`.

## Security notes

Passwords use ASP.NET Core `PasswordHasher`; prices, totals, roles, stock, and status transitions are server-authoritative. Checkout and cancellation use serializable PostgreSQL transactions. Customer order/cart queries derive ownership from JWT claims. Product and category deletion is soft-disable. Errors use Problem Details, uploads are type/size checked, and CORS is configured to exact origins.
