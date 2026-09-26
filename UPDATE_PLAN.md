  ## Working rules

  For every logical change:

  1. Add or update tests first where practical.
  2. Make the smallest implementation change.
  3. Run the nearest backend and frontend tests.
  4. Run full build, type-check, lint, and formatting checks.
  5. Start the real frontend and backend.
  6. Exercise the affected feature through Playwright or an interactive browser.
  7. Inspect browser console and failed network requests.
  8. Test phone, tablet, and desktop layouts when UI is affected.
  9. Update IMPLEMENTATION_STATUS.md with actual evidence.
  10. Commit the green logical change on a dedicated branch, so it can be reverted independently.

  Real Neon will not be reset or wiped. Cloudinary cleanup will only delete assets created and recorded by our tests.

  ## Phase 0 — Protect the existing project and establish a baseline

  Before restructuring anything:

  - Create a dedicated remediation branch.
  - Confirm the worktree is clean.
  - Validate required secret keys without displaying values.
  - Record installed .NET, Node, npm, Docker, browser, and PostgreSQL tooling.
  - Inspect the real Neon schema and __EFMigrationsHistory read-only.
  - Resolve why the status file says the existing schema is not properly baselined before applying any new migration.
  - Export or create an appropriate recoverable database backup/Neon branch if available.
  - Capture current screenshots at:
      - 390×844
      - 768×1024
      - 1440×900

  - Run the existing backend, frontend, and Playwright tests to establish the real starting behavior.
  - Record current API responses and known failures without exposing secrets.

  If required, install:

  - .NET 10 SDK.
  - EF Core 10 CLI tooling.
  - Node 24 LTS.
  - Playwright Chromium and system dependencies.
  - Docker Desktop/start its daemon.
  - PostgreSQL/Testcontainers prerequisites.

  If Docker cannot be made available, I will use a dedicated disposable PostgreSQL database or Neon test branch—not the owner’s development data—as the integration-test database.

  ## Phase 1 — Build a meaningful quality harness

  This comes before major refactoring so regressions can be detected.

  ### Backend testing

  Create BasicCommerce.IntegrationTests using:

  - WebApplicationFactory
  - Disposable PostgreSQL through Testcontainers
  - Isolated database per test collection/run
  - Test JWT/admin/customer helpers
  - Deterministic product and order fixtures

  Initial integration coverage:

  - Register and duplicate registration.
  - Valid and invalid login.
  - Inactive account login.
  - Customer denied from admin endpoints.
  - Category create/update/disable/filter.
  - Product create/update/disable/filter.
  - Cart ownership, add/upsert/update/remove.
  - Checkout success, empty cart, inactive product/category, and stock conflict.
  - Price and product-name snapshots.
  - Order ownership/IDOR.
  - Customer and admin cancellation.
  - Stock restoration exactly once.
  - Valid and invalid admin transitions.
  - Problem Details response shapes.

  ### Frontend testing

  Install and configure:

  - React Testing Library.
  - @testing-library/user-event.
  - jest-dom matchers for Vitest.
  - MSW or a small controlled fetch mock layer.
  - ESLint TypeScript, React, React Hooks, and accessibility rules.
  - Prettier scripts and stable formatting configuration.

  Replace the trivial string test with tests for:

  - Problem Details parsing.
  - Non-JSON/network failures.
  - Auth guards and 403 handling.
  - Login return URL.
  - Cart quantity constraints.
  - Checkout submission lock.
  - Status-action rendering.
  - Product edit preservation.
  - Loading, empty, and error states.

  ### Verification

  - Full backend unit/integration suite.
  - Frontend unit/component suite.
  - Existing E2E suite.
  - Live app smoke through the browser.
  - No console errors or unexpected failed requests.

  ## Phase 2 — Upgrade to the documented runtime

  Upgrade:

  - All projects from .NET 9 to .NET 10.
  - ASP.NET Core packages to compatible .NET 10 versions.
  - EF Core and Npgsql to compatible version 10 packages.
  - Backend Docker SDK/runtime images to .NET 10.
  - C# language baseline as required.
  - Any affected EF tooling and migrations.

  Frontend dependencies will be pinned to deliberate compatible versions rather than "latest".

  ### Verification

  - Restore and build with warnings treated seriously.
  - Run every backend test against PostgreSQL.
  - Run migration creation/application against a fresh disposable database.
  - Start the upgraded API and frontend.
  - Run full customer and admin smoke flows.

  ## Phase 3 — Repair the backend architecture without changing API behavior

  Keep minimal APIs, since the architecture docs permit endpoints, but make them thin and modular.

  Create:

  - Application DTOs and contracts.
  - Application service interfaces and implementations.
  - Validation components.
  - Authentication/profile service.
  - Category service.
  - Product service.
  - Cart service.
  - Checkout/order service.
  - Admin-order service.
  - Dashboard service.
  - Image-storage abstraction.
  - Endpoint modules grouped by feature.
  - Central user/claim accessor.

  Move EF and Cloudinary details out of Program.cs.

  Program.cs should become composition only:

  - Configuration.
  - Dependency injection.
  - Middleware.
  - Authentication/authorization.
  - Endpoint mapping.
  - Startup behavior.

  Add strongly typed and startup-validated:

  - JwtOptions
  - CloudinaryOptions
  - CorsOptions
  - SeedOptions

  Pass CancellationToken through HTTP handlers, services, EF operations, and Cloudinary calls.

  ### Verification

  Each extracted feature will be tested before moving to the next:

  1. Auth/profile.
  2. Categories.
  3. Products/media.
  4. Cart.
  5. Checkout/orders.
  6. Admin/dashboard.

  API response compatibility tests will ensure the frontend is not broken by the internal refactor.

  ## Phase 4 — Centralize validation and error handling

  Implement consistent server validation for:

  - Email format and maximum length.
  - Password policy.
  - Names and phone limits.
  - Shipping-address limits.
  - Category/product existence and state.
  - Prices and stock.
  - Quantities.
  - Enum/status values.
  - Upload metadata and contents.

  Implement central exception mapping for:

  - Validation → 400.
  - Authentication → 401.
  - Authorization → 403/404.
  - Missing records → 404.
  - Unique conflicts → 409.
  - Stock/concurrency conflicts → 409.
  - Invalid transitions → 409.
  - Unexpected errors → safe 500.

  All errors will use the documented RFC 7807 structure with:

  - Status.
  - Title.
  - Detail.
  - Stable code.
  - Trace ID.
  - Field errors where relevant.

  Add request logging and useful admin-change logging without recording secrets, passwords, JWTs, or authorization headers.

  ### Verification

  - Malformed and adversarial HTTP integration tests.
  - Duplicate/race tests.
  - Production-mode unexpected-error test confirming no stack trace or database detail leaks.
  - Frontend field-level and banner error rendering.

  ## Phase 5 — Fix database integrity and concurrency

  First resolve the migration-history baseline safely.

  Then add non-destructive migrations for:

  - Price and stock constraints.
  - Order total constraints.
  - Order-item quantity and line-total constraints where appropriate.
  - Missing compound indexes.
  - Missing maximum lengths.
  - Automatic UpdatedAt maintenance.
  - Order concurrency protection.
  - Any safe naming corrections agreed to from the preferred snake_case convention.

  Existing columns will not be destructively recreated just to change naming. Renames will only be performed if proven safe on a disposable copy first.

  Correct business concurrency:

  - Atomic conditional stock deduction during checkout.
  - Map stock/concurrency failures to 409.
  - Prevent two competing order transitions from overwriting each other.
  - Handle cart creation/upsert uniqueness races.
  - Handle category/product slug races.
  - Generate collision-resistant order numbers with retry protection.
  - Revalidate active product and active category during cart update and checkout.
  - Ensure cancellation restoration is idempotent even under concurrent requests.

  ### Verification

  - Fresh migration test.
  - Upgrade test from a copy of the current schema.
  - Parallel checkout test against one low-stock product.
  - Parallel cancellation test.
  - Parallel status-transition test.
  - Constraint-violation tests.
  - Real Neon smoke only after disposable PostgreSQL passes.

  ## Phase 6 — Refactor the frontend into the documented structure

  First split code without intentionally changing visuals.

  Target structure:

  src/
    api/
    app/
    components/
    features/
      auth/
      catalog/
      cart/
      checkout/
      orders/
      admin/
    hooks/
    layouts/
    pages/
    routes/
    styles/
    types/
    utils/

  Create:

  - Central typed API client.
  - Central Problem Details parser.
  - Auth token utility.
  - Auth/session event handling.
  - Reusable loading, error, empty, status, pagination, and form components.
  - Feature-level API and type modules.
  - Thin route pages.

  Remove the custom useEffect wrapper and implement proper effects with cleanup/abort handling.

  ### Verification

  After each extracted feature:

  - Component tests.
  - Type-check/lint/format/build.
  - Relevant Playwright scenario.
  - Visual comparison with the baseline screenshots.
  - Console/network inspection.

  ## Phase 7 — Adopt the documented styling and form conventions

  Introduce Tailwind with semantic theme tokens:

  - Background.
  - Surface.
  - Text.
  - Muted.
  - Primary.
  - Border.
  - Success.
  - Warning.
  - Danger.

  Migrate styling component-by-component rather than replacing the entire UI at once.

  Use React Hook Form and Zod for non-trivial forms:

  - Registration.
  - Login where helpful.
  - Profile/password.
  - Checkout.
  - Category management.
  - Product create/edit.

  At the end, remove obsolete CSS and ensure no duplicated styling system remains.

  ### Verification

  For every migrated component:

  - Visual comparison.
  - Keyboard-only operation.
  - Focus visibility.
  - Screen-reader labels/status regions.
  - All three required viewport sizes.
  - No horizontal page overflow.

  ## Phase 8 — Complete missing frontend behavior

  ### Public/customer

  Implement or correct:

  - Shop category filter.
  - Stable URL search/filter/sort/page state.
  - Debounced or controlled search behavior.
  - Loading skeletons.
  - Error with retry.
  - Clear-filter empty action.
  - Product loading versus true 404 distinction.
  - Safe login returnTo.
  - Auth-state update and redirect after 401.
  - Cart item images.
  - Stock-change recovery.
  - Customer order pagination.
  - Correct order confirmation/details states.
  - Explicit 403 and 404 pages.

  ### Admin categories

  Add:

  - Edit category.
  - Search if appropriate.
  - Loading/empty/error states.
  - Confirmation for disabling when meaningful.
  - Inline validation.

  ### Admin products

  Add:

  - Search, active filter, category filter, and pagination.
  - Dedicated admin product-detail endpoint or equivalent.
  - Editing disabled products.
  - Active/inactive control.
  - Explicit disable action.
  - Stock update workflow.
  - Correct image public-ID preservation.
  - Upload retry and progress state.

  ### Admin orders

  Add:

  - Search.
  - Status filter.
  - Pagination.
  - Loading/empty/error states.
  - Conflict refresh behavior.
  - Valid next transitions only.

  ### Visual/accessibility

  Add:

  - Distinct textual and visual status badges.
  - Accessible announcements.
  - Correct labels for every control.
  - Mobile navigation/table behavior.
  - Confirmations for meaningful destructive actions.

  ## Phase 9 — Complete Cloudinary lifecycle handling

  Implement the documented Infrastructure adapter.

  Correct behavior:

  1. Validate type, size, zero length, and actual image content.
  2. Upload new image.
  3. Save the product with URL and public ID.
  4. After successful DB update, delete the old image only if its public ID belongs to the configured application folder.
  5. Log cleanup failure without invalidating an otherwise successful product update.
  6. Track and clean test uploads safely.

  Add tests using an abstraction/fake for normal integration tests, plus a limited real Cloudinary smoke test.

  If demo images are added:

  - Use properly licensed sources.
  - Record every source in ASSET_SOURCES.md.
  - Upload to the configured folder.
  - Avoid trademarks and recognizable-person issues.
  - Make seeding idempotent.

  ## Phase 10 — Expand complete browser acceptance coverage

  Split Playwright into focused, repeatable specs:

  - Public catalog/search/filter/sort/pagination.
  - Register/login/profile/password/logout.
  - Customer/admin boundary and direct API 403.
  - Category lifecycle.
  - Product/image lifecycle.
  - Cart add/upsert/update/remove/persistence.
  - Checkout success and submission lock.
  - Price snapshot.
  - Stock conflict.
  - Customer cancellation and stock restoration.
  - Admin cancellation.
  - Admin order lifecycle.
  - IDOR with two users.
  - Backend-down/network recovery.
  - 403/404.
  - Responsive behavior at all required viewports.
  - Browser security observation.

  Tests will create uniquely identified data and clean only their own safe artifacts.

  ## Phase 11 — Docker and deployment verification

  After application behavior is green:

  - Build the backend .NET 10 image.
  - Build the frontend Node 24 image.
  - Start both against a disposable PostgreSQL environment where practical.
  - Run the browser suite against containers.
  - Verify PORT and 0.0.0.0.
  - Verify SPA deep-link fallback.
  - Inspect images and frontend bundles for leaked secrets.
  - Verify production-mode CORS and safe exception behavior.
  - Verify production startup does not seed demo/admin data.

  No production deployment will occur unless you explicitly request it.

  ## Phase 12 — Documentation reconciliation and final audit

  Update documentation to match reality:

  - Correct README setup instructions.
  - Add migration and seeding commands.
  - Add every test command.
  - Add Docker commands.
  - Reconcile Render versus Vercel guidance.
  - Remove the false Compose claim.
  - Update API contract for any deliberately changed shapes.
  - Record asset sources.
  - Replace overstated status claims with reproducible evidence.
  - Complete the Definition of Done checklist honestly.
  - List any remaining limitations.

  ## Final release gate

  The work will be considered complete only after:

  dotnet format --verify-no-changes
  dotnet build
  dotnet test
  dotnet package vulnerability check

  npm run lint
  npm run format:check
  npm run typecheck
  npm test
  npm run build
  npm run e2e
  npm audit

  And additionally:

  - Fresh PostgreSQL migration passes.
  - Existing-schema upgrade rehearsal passes.
  - Real Neon smoke passes without destructive reset.
  - Real Cloudinary upload/load/folder/delete smoke passes.
  - Docker builds and container browser flow pass.
  - Browser console/network checks are clean.
  - Phone/tablet/desktop acceptance passes.
  - No tracked secrets are found.