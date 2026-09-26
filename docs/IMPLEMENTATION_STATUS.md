# Implementation Status

## 2026-09-24 documentation compliance remediation — in progress
- [x] Work moved to `codex/docs-compliance-remediation` branch.
- [x] .NET 10 SDK and Node 24 LTS installed; backend projects, EF Core, Npgsql, and EF CLI upgraded to .NET/EF 10.
- [x] Backend .NET 10 build: zero warnings; 9 unit tests pass.
- [x] HTTP/PostgreSQL integration project added: 2 tests pass using an isolated schema on the direct development Neon connection. Schema selection is verified before the API starts; the test schema is removed after the suite.
- [x] Test-harness isolation mistake identified and corrected. Three test users, one test category, one test product, one cart, and one cancelled order created in the development schema were removed by exact ID in a transaction; subsequent audit found no matching records. One empty test schema left by a failed setup was also removed.
- [x] Frontend dependencies pinned; ESLint TypeScript/React Hooks rules and Prettier check enabled.
- [x] Shared frontend API client extracted with five tests covering Problem Details, 204, non-JSON failures, 401 cleanup, and multipart uploads.
- [x] Live .NET 10 API readiness and Vite frontend verified; 2 Playwright customer/admin browser tests pass after these changes.
- [x] Broader backend integration coverage added (auth, category, product, cart, checkout, admin transitions).
- [x] Frontend component testing with Vitest/RTL added for UI states, auth guards, cart constraints.
- [x] Architecture refactors (services, application layer), validation, and Database constraints (Phase 3-5) complete.
- [x] Frontend refactored into modular directories with Tailwind CSS v4 and React Hook Form (Phase 6-7) complete.
- [x] UI refinements, Admin features, and Cloudinary lifecycle (Phase 8-9) complete.
- [x] Final documentation audit and E2E spec modularization complete.
- [ ] Docker verification intentionally omitted at the owner's request because Docker Desktop slows the host. Direct `dotnet run` and `npm run dev` are used for browser checks.

## Foundation
- [x] Repository structure and secret ignore rules created
- [x] Layered backend solution and frontend app created
- [x] Backend/frontend Dockerfiles created (no root Compose file is present or required by the current local development guide)
- [x] Health liveness/readiness endpoints verified
- [x] Initial EF Core migration generated
- [~] Migration generated; development Neon schema was created safely during smoke setup, but the existing schema has not been retroactively baselined into `__EFMigrationsHistory`

## Backend features
- [x] Seven core entities, PostgreSQL mappings, indexes, constraints, and seed data
- [x] JWT registration/login/profile/password and Admin role authorization
- [x] Public/admin category APIs
- [x] Public/admin product APIs and soft disable
- [x] Backend-only Cloudinary image upload with MIME/size validation
- [x] PostgreSQL cart with ownership, upsert, quantity, remove, and clear behavior
- [x] Transactional COD checkout with server totals, snapshots, stock deduction, and cart clearing
- [x] Customer order list/detail and Pending cancellation
- [x] Transactional cancellation with single stock restoration
- [x] Admin order search/list/detail/status transition APIs
- [x] Admin dashboard summary
- [x] Problem Details responses, exact-origin CORS, Swagger, and health endpoints

## Frontend features
- [x] Responsive public shell, home, catalog/search/sort/paging, and product details
- [x] Register/login/logout, session token, protected routes, profile, and password page
- [x] Database-backed cart, refresh persistence, quantity/remove flows, and badge refresh
- [x] COD checkout, order confirmation, order history/detail, and cancellation action
- [x] Admin dashboard, categories, products, Cloudinary file upload/preview, and edit route
- [x] Admin order list/detail with only valid next-status actions
- [x] Loading, empty, error, 403/404 behavior and responsive CSS
- [x] No Redux and no React Context global store

## Quality gates
- [x] Backend build: clean, zero warnings
- [x] Backend unit tests: 9 passed
- [x] Isolated-schema PostgreSQL HTTP integration suite: 2 scenarios pass against the direct development connection without touching the public schema
- [x] Frontend lint: passed (the original empty ESLint ruleset has since been replaced by active TypeScript/React Hooks rules)
- [x] Frontend strict type-check: passed
- [x] Frontend tests: original 1 trivial test replaced by 5 API-client behavior tests
- [x] Frontend production build: passed
- [x] Playwright real-browser core customer flow: passed
- [x] Playwright admin authorization/navigation/order lifecycle: passed
- [x] Real Neon readiness/catalog/register/cart/checkout/order smoke: passed
- [x] Real Cloudinary upload/folder/delete smoke: upload 201, folder valid, delete `ok`
- [x] Source secret scan: zero matches outside ignored `info.txt`
- [x] npm high-severity audit: zero vulnerabilities
- [ ] Docker image/Compose run: intentionally not attempted at the owner's request; local verification uses direct processes
- [ ] Interactive computer-use browser: unavailable (browser inventory empty); Playwright Chromium used instead

## Evidence log

### 2026-09-20/21 UTC — foundation, database, auth, catalog
- Backend: `dotnet build back/BasicCommerce.sln --no-restore` passed.
- Neon: external connectivity, schema creation, `/health/ready`, seed categories and 8 products verified.
- Frontend: lint/type-check/build and home/catalog browser navigation verified with Playwright.
- Bugs fixed: EF package mismatch, PostgreSQL quoted check constraint, seed slug mismatch, local protected-route hydration.

### 2026-09-20/21 UTC — customer commerce flow
- Browser: register unique user, login, search/open product, add to cart, refresh persistence, checkout COD, order confirmation, and My Orders passed.
- Network: auth/cart/order endpoints returned expected successful statuses; checkout explicitly asserted HTTP 201.
- Bugs fixed: async React effect cleanup crash, protected-route refresh race, string enum JSON checkout parsing.

### 2026-09-20/21 UTC — admin and Cloudinary
- Browser: admin login/dashboard/categories/products/orders authorization passed; image file field present; Pending -> Confirmed -> Shipped -> Delivered passed.
- Cloudinary: backend-authenticated temporary PNG upload returned 201 in configured folder; test asset deletion returned `ok`.
- One earlier smoke upload succeeded before cleanup-form encoding was corrected; its unrecorded random public ID could not be safely deleted without risking unrelated assets.

### 2026-09-21 UTC — final regression
- Backend: format, build, and 9 unit tests passed.
- Frontend: lint, strict type-check, unit test, production build, Playwright scenarios, and dependency audit passed.
- Security: `info.txt`/env patterns ignored; zero configured secret-value matches found in source files.
- Remaining environment issue: Docker CLI exists but `docker_engine` is not running, so image builds and container browser smoke remain unverified.
