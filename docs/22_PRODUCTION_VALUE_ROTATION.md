# 22 - Render Environment Checklist

The existing database already contains the admin and product data. Render does not need seed variables, and Production startup does not run the development seeder.

## Backend service

Configure one complete Npgsql connection string:

```text
ConnectionStrings__Default=Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require
```

Do not split it into separate database variables. Also configure the JWT, Cloudinary, exact frontend CORS origin, and `ASPNETCORE_ENVIRONMENT=Production` variables documented in `docs/16_DEPLOYMENT.md`.

Do not configure `PORT`; Render supplies it.

## Frontend service

Configure only the public API address:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND-SERVICE.onrender.com/api
```

Never expose backend secrets through a `VITE_*` variable.

## Final checks

- [ ] backend `/health/live` succeeds;
- [ ] backend `/health/ready` reaches the existing PostgreSQL database;
- [ ] frontend calls the Render backend URL;
- [ ] backend CORS contains the exact frontend URL;
- [ ] existing admin login and products work;
- [ ] no secret is committed or present in a frontend build argument.
