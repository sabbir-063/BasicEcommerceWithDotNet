# 11 - Implementation Order

Codex should work in vertical, testable slices. Do not build all backend code first and postpone browser testing until the end.

## Phase 0 - Preflight

### Tasks
1. Read all docs.
2. Read and validate `info.txt` keys without printing secrets.
3. Initialize Git ignore rules.
4. Create/update `IMPLEMENTATION_STATUS.md`.
5. Verify local tools:
   - .NET 10 SDK;
   - Node 24 LTS-compatible environment;
   - Docker;
   - browser automation capability.
6. Check real Neon connectivity using a safe read-only query.
7. Check Cloudinary credential validity without uploading unnecessary assets if a lightweight authenticated check is available.

### Done when
- required keys exist;
- credentials are not tracked;
- toolchain is usable;
- no application feature code has hidden dependency on production credentials.

## Phase 1 - Repository foundation

### Backend
- create solution/projects;
- dependency references in correct direction;
- config binding;
- Problem Details middleware;
- health endpoints;
- OpenAPI Development config;
- CORS development origin;
- first build/test.

### Frontend
- Vite React TypeScript;
- strict TypeScript;
- Tailwind;
- React Router;
- base layout;
- API client;
- app error/loading primitives;
- lint/typecheck/test scripts.

### Docker
- backend Dockerfile;
- frontend Dockerfile;
- root compose skeleton.

### Browser test
- home shell loads;
- backend health responds;
- frontend can call one non-sensitive API/health proxy path if configured.

## Phase 2 - Database foundation

### Tasks
- create entities/enums/configurations;
- create DbContext;
- indexes/check constraints;
- initial migration;
- apply to development Neon direct connection;
- verify schema;
- idempotent development admin seeder skeleton.

### Tests
- migration applies cleanly;
- fresh test DB integration test;
- DB constraints reject invalid stock/quantity where covered.

## Phase 3 - Authentication and profile

### Backend
- register;
- login;
- JWT;
- `me`;
- profile update;
- password change;
- Admin role seed;
- auth/role tests.

### Frontend
- login/register pages;
- session token utility;
- protected route logic;
- profile/change password;
- admin route UX guard.

### Browser acceptance
- register new customer;
- login;
- refresh page and remain authenticated within session;
- open profile;
- change profile;
- logout;
- customer cannot access admin API;
- admin login succeeds.

## Phase 4 - Categories

### Backend
- public active categories;
- admin list/create/edit/enable/disable.

### Frontend
- home category section;
- admin category management.

### Tests
- duplicate/invalid category;
- disabled category hidden publicly;
- admin-only enforcement.

## Phase 5 - Cloudinary media

### Backend
- Cloudinary adapter;
- admin upload endpoint;
- validation;
- optional project-folder-safe delete.

### Frontend
- admin upload widget/field.

### Real smoke test
Upload one image with development credentials, load URL in browser, then clean test asset if not used.

## Phase 6 - Products and catalog

### Backend
- product CRUD/soft disable;
- public list/details;
- pagination/search/category/sort;
- validation.

### Frontend
- Home featured/new products;
- Shop page;
- Product detail;
- Admin product list/form;
- upload image then save product.

### Browser test
Admin creates a product with a real Cloudinary image. Customer searches, filters, opens detail.

## Phase 7 - Database-backed cart

### Backend
- get/create cart;
- add/upsert item;
- update quantity;
- remove;
- clear;
- stock validation;
- server-calculated totals.

### Frontend
- add to cart;
- cart page;
- quantity controls;
- remove;
- header cart count refresh.

### Browser test
Add two products, change quantities, refresh, verify cart persists from DB.

## Phase 8 - Checkout and order creation

### Backend
- COD checkout request;
- transaction;
- stock revalidation;
- order/item snapshots;
- stock decrement;
- clear cart;
- concurrency safety;
- customer order list/details.

### Frontend
- checkout form;
- order summary;
- submission lock;
- confirmation/order detail;
- My Orders.

### Tests
- empty cart;
- inactive product;
- insufficient stock;
- price changes before checkout;
- concurrent/atomic stock behavior;
- successful checkout snapshots price and clears cart.

### Browser test
Complete the full customer purchase flow using Neon development DB.

## Phase 9 - Cancellation

### Backend
- customer Pending cancellation;
- admin Pending/Confirmed cancellation;
- stock restore exactly once;
- invalid transition conflict.

### Frontend
- customer Cancel button only when eligible;
- admin cancellation action only when eligible.

### Tests
- restore stock once;
- repeat cancel does not double stock;
- cannot cancel Shipped/Delivered.

## Phase 10 - Admin orders and dashboard

### Backend
- paginated admin orders;
- filters/search;
- status transition endpoint;
- dashboard summary.

### Frontend
- admin order list/detail;
- valid next-status actions;
- dashboard cards.

### Browser test
Admin progresses an order Pending -> Confirmed -> Shipped -> Delivered.

## Phase 11 - Demo data and visual polish

- source permitted demo images according to asset doc;
- upload to dev Cloudinary;
- seed 3-4 categories, 6-10 products;
- responsive polish;
- loading/empty/error states;
- accessibility pass;
- 404/403 pages.

## Phase 12 - Automated E2E and regression

- implement Playwright core flows;
- run all backend tests;
- run frontend tests;
- run E2E;
- fix flakiness caused by shared seed state;
- browser manual check at phone/tablet/desktop.

## Phase 13 - Docker validation

- build backend image;
- build frontend image;
- run compose;
- repeat core browser flow against containers;
- verify secrets are runtime-injected, not image-baked.

## Phase 14 - Deployment readiness only

Do not deploy unless explicitly instructed.

Prepare:
- Vercel settings guide;
- Render settings guide;
- production env checklist;
- migration command/procedure;
- health check path;
- CORS production config;
- SPA rewrite handling;
- final README.

## Feature-slice completion protocol
After each phase, Codex must:
1. run formatter;
2. run relevant tests;
3. build affected projects;
4. use browser for user-visible behavior;
5. inspect browser console/network for unexpected errors;
6. update `IMPLEMENTATION_STATUS.md`;
7. commit only if the environment/workflow expects commits and no secrets are staged.
