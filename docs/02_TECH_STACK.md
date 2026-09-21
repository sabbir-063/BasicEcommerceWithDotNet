# 02 - Technology Stack

## Runtime baseline
Use stable supported releases, not previews.

### Backend
- .NET 10 LTS
- ASP.NET Core Web API
- C# 14 / language version matching .NET 10 SDK
- Entity Framework Core 10
- Npgsql EF Core provider
- PostgreSQL on Neon
- JWT Bearer authentication
- ASP.NET Core password hashing / Identity primitives
- Cloudinary .NET SDK
- OpenAPI/Swagger in Development
- xUnit for backend tests

Do not use .NET 11 preview/RC for this project.

### Frontend
- Node.js 24 LTS for local/CI baseline
- React
- Vite
- TypeScript with strict mode
- React Router
- `fetch` or a small Axios client; choose one and use consistently
- Tailwind CSS for styling
- React Hook Form for non-trivial forms
- Zod for client form schemas where useful
- Vitest + React Testing Library
- Playwright for repeatable browser E2E tests

No Redux. Do not introduce a React Context global store merely to hold application state.

## Frontend state policy
Use the smallest state scope possible:
- component state for UI state;
- route/search params for catalog search/filter/paging;
- server APIs as source of truth for cart/orders/products;
- `sessionStorage` only for the JWT access token in this MVP if bearer-token auth is used;
- a tiny auth utility/module may expose `getToken`, `setToken`, `clearToken`, and authenticated fetch helpers.

Do not duplicate server entities into a custom global state framework.

## HTTP choice
Prefer a small typed `fetch` wrapper to keep dependencies low. It should:
- prepend API base URL;
- attach bearer token when present;
- set JSON headers appropriately;
- parse Problem Details errors;
- handle `204 No Content`;
- clear stale auth on `401` where appropriate;
- support `FormData` without manually forcing `Content-Type`.

## Authentication scope
For MVP, use access-token JWT bearer authentication and explicit re-login after expiry. Do not add refresh tokens unless requested later.

Store the access token in `sessionStorage`, not LocalStorage, and never store passwords.

This is an MVP tradeoff. The security doc records future hardening options.

## Styling/UI packages
Keep UI dependency count small. Tailwind CSS plus an icon library such as Lucide is enough. A lightweight toast library is acceptable.

Do not introduce a large component framework unless it materially reduces complexity.

## Database naming and conventions
- PostgreSQL snake_case physical table/column names are preferred.
- Domain/C# property names use PascalCase.
- UUID/Guid primary keys.
- `numeric(12,2)` for money.
- `timestamptz` for timestamps.
- UTC in API and DB.

## API style
REST JSON API under `/api`.

Use:
- nouns in paths;
- standard HTTP methods;
- status codes with consistent RFC 7807 Problem Details error bodies;
- DTOs rather than serializing EF entities;
- pagination metadata for list endpoints.

## Docker
- backend: multi-stage .NET SDK -> ASP.NET runtime image;
- frontend: multi-stage Node build -> Node `serve` runtime image;
- both images deploy as independent Render Docker Web Services;
- both services honor Render's platform-provided `PORT`.
