# 10 - Docker and Local Development

The repository contains two independent Docker images:

- `front/Dockerfile` builds the Vite application and serves `dist/` with the Node `serve` package.
- `back/Dockerfile` publishes and runs the ASP.NET Core API.

The images are deployed as separate Render Web Services. There is no Docker Compose, Nginx, proxy, or database container.

## Ports

- Local Vite frontend: `http://localhost:5173`
- Local ASP.NET backend: `http://localhost:5284`
- Render: both containers bind to the platform-provided `PORT`; `10000` is only the image fallback.

## Configuration

The frontend receives only `VITE_API_BASE_URL` during its Docker build. The backend receives all secrets at runtime through Render environment variables.

`ConnectionStrings__Default` contains the complete Npgsql connection string. PostgreSQL host, port, database, username, and password do not need separate variables.

Production startup applies EF Core migrations and does not execute development seed data.
