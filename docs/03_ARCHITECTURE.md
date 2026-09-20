# 03 - Architecture

## High-level production architecture

```text
Browser
  |
  | HTTPS
  v
React/Vite frontend (Vercel)
  |
  | HTTPS JSON REST API
  v
ASP.NET Core API (Render)
  |                    \
  | TLS                 \ HTTPS
  v                       v
Neon PostgreSQL          Cloudinary
```

## Repository structure

```text
/
|-- front/
|   |-- src/
|   |   |-- api/
|   |   |-- app/
|   |   |-- components/
|   |   |-- features/
|   |   |   |-- auth/
|   |   |   |-- catalog/
|   |   |   |-- cart/
|   |   |   |-- checkout/
|   |   |   |-- orders/
|   |   |   `-- admin/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- styles/
|   |   |-- types/
|   |   `-- utils/
|   |-- tests/
|   |-- e2e/
|   |-- Dockerfile
|   `-- package.json
|
|-- back/
|   |-- src/
|   |   |-- BasicCommerce.Api/
|   |   |-- BasicCommerce.Application/
|   |   |-- BasicCommerce.Domain/
|   |   `-- BasicCommerce.Infrastructure/
|   |-- tests/
|   |   |-- BasicCommerce.UnitTests/
|   |   `-- BasicCommerce.IntegrationTests/
|   |-- BasicCommerce.sln
|   `-- Dockerfile
|
|-- docs/
|-- templates/
|-- info.txt
|-- docker-compose.yml
`-- README.md
```

Use `APP_NAME` only for displayed branding/configuration. Project namespaces can remain stable (for example `BasicCommerce`) even if the store display name changes.

## Backend dependency direction

```text
Api -> Application -> Domain
Api -> Infrastructure -> Application/Domain
Infrastructure -> Application/Domain
Domain -> no project dependency
```

### Domain
Contains:
- entities;
- enums;
- domain rules that do not require infrastructure;
- value-level validation helpers where appropriate.

### Application
Contains:
- use-case services;
- DTOs/contracts;
- interfaces for infrastructure dependencies;
- validators;
- authorization-aware business orchestration.

### Infrastructure
Contains:
- EF Core DbContext and entity configuration;
- migrations;
- repository/query implementations only where abstraction adds value;
- Cloudinary adapter;
- clock/ID/external implementations.

### API
Contains:
- controllers/endpoints;
- authentication/authorization setup;
- middleware;
- dependency injection wiring;
- OpenAPI;
- configuration binding;
- health endpoints.

## Repository-pattern guidance
Do not create generic repository abstractions around every EF Core entity merely for ceremony. EF Core already implements unit-of-work/repository-like behavior.

Use application services with DbContext-backed infrastructure. Add a specialized repository/query abstraction only when it improves testability or encapsulates complex persistence behavior.

## Frontend architecture
Use feature folders. Keep pages thin and delegate reusable behavior to feature-level components/api modules.

Example:

```text
features/cart/
|-- cart.api.ts
|-- cart.types.ts
|-- CartItemRow.tsx
|-- CartSummary.tsx
`-- cart.validation.ts
```

## Cross-cutting policies

### IDs
Use UUIDs/Guid for entity primary keys.

### Time
Use `DateTimeOffset` in C# and PostgreSQL `timestamptz`. Generate timestamps on the server in UTC.

### Money
Use decimal in C#, PostgreSQL `numeric(12,2)`, and never floating-point for currency.

### Transactions
Checkout is a transaction boundary:
1. load authenticated user's cart;
2. reload active products;
3. validate quantities and stock;
4. compute server-side total;
5. create Order;
6. create OrderItems with snapshots;
7. decrement stock;
8. clear cart items;
9. commit.

Any failure rolls back all changes.

Cancellation is also transactional when stock restoration occurs.

### Concurrency
At checkout, prevent stock from becoming negative under concurrent orders. Implement either:
- optimistic concurrency with a PostgreSQL/EF concurrency token and retry/conflict handling; or
- atomic conditional stock update where affected rows prove stock was available.

Do not rely only on a prior read/check.

## Health endpoints
Provide:
- `GET /health/live` - process liveness, no external dependency requirement;
- `GET /health/ready` - checks database connectivity and required runtime dependencies where practical.

Avoid calling Cloudinary on every readiness probe; configuration presence is enough, with Cloudinary tested separately by smoke test.
