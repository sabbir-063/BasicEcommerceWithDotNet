# Agent Execution Tracker

This document acts as the central source of truth for AI agents working on this repository to execute the `UPDATE_PLAN.md`. It tracks what has been completed, what needs to be done next, and the exact flow to follow.

## 🔄 Agent Workflow Rules

1. **Read State First:** Check this file (`AGENT_PROGRESS.md`) to understand the current phase and pending tasks.
2. **Branching:** Work on one phase (or logical sub-phase) at a time on a dedicated branch (e.g., `feature/phase-1-quality-harness`).
3. **Validation:** For every logical change, run backend unit/integration tests and frontend lint/typecheck/tests. Ensure they are green.
4. **Completion:** When a phase is complete, commit the changes, merge the branch into `main`, and create the next branch from `main`.
5. **Update State:** Update the checkboxes in this file and `docs/IMPLEMENTATION_STATUS.md` as work completes.

---

## 📈 Execution Plan & Status

### ✅ Pre-Requisites & Phase 2 (Runtime Upgrade)
- **Branch:** `codex/docs-compliance-remediation` (Merged to `main`)
- [x] Upgrade to .NET 10 and EF Core 10.
- [x] Pin frontend dependencies (Vite, React) and enable ESLint/Prettier.
- [x] Establish base `BasicCommerce.IntegrationTests` project with isolated schema setup.
- [x] Extract shared frontend API client with initial tests.

### ✅ Phase 1: Build a Meaningful Quality Harness
- **Branch:** `feature/phase-1-quality-harness` (Merged to `main`)
- **Backend Integration Tests:**
  - [x] Auth & Profile (Register, login, active/inactive, admin route denial).
  - [x] Categories (Create, update, disable, filter).
  - [x] Products (Create, update, disable, filter).
  - [x] Cart (Ownership, add, upsert, update, remove).
  - [x] Checkout & Orders (Success, empty cart, inactive product, stock conflict, price snapshots, cancellation).
  - [x] Problem Details response shapes validation.
- **Frontend Component Tests:**
  - [x] Setup React Testing Library, user-event, jest-dom, and fetch/MSW mocks.
  - [x] Problem Details parsing and non-JSON failures.
  - [x] Auth guards, 403 handling, and login return URL.
  - [x] Cart quantity constraints & Checkout submission locks.
  - [x] Status-action rendering and product edit preservation.

### ✅ Phase 3: Repair Backend Architecture
- **Branch:** `feature/phase-3-backend-arch`
- [x] Move EF Core and Cloudinary initialization out of `Program.cs`.
- [x] Create Application DTOs, Contracts, and Validation components.
- [x] Implement Application Services (Auth, Category, Product, Cart, Checkout, Dashboard).
- [x] Group endpoints by feature modules (Minimal APIs).

### ✅ Phase 4 & 5: Error Handling & Database Integrity
- **Branch:** `feature/phase-4-5-data-integrity`
- [x] Implement robust server validation (email, password, limits, unique states).
- [x] Centralize Exception Mapping to RFC 7807 Problem Details (400, 401, 403, 404, 409, 500).
- [x] Baseline EF Migrations safely.
- [x] Add Database Constraints (prices, stock, order totals, atomic stock deductions, missing indexes).

### ⏳ Phase 6 & 7: Frontend Refactor & Tailwind
- **Branch:** `feature/phase-6-7-frontend-refactor`
- [ ] Restructure frontend into `api`, `app`, `components`, `features`, `hooks`, `pages`, `routes`, `styles`, `utils`.
- [ ] Introduce Tailwind CSS with semantic theme tokens (Background, Surface, Text, Primary, Success, etc.).
- [ ] Replace inline CSS with Tailwind.
- [ ] Introduce React Hook Form + Zod for forms (Registration, Login, Checkout, Product/Category management).

### ⏳ Phase 8 & 9: Frontend Missing Features & Cloudinary
- **Branch:** `feature/phase-8-9-ui-cloudinary`
- [ ] UI refinements: Category filters, stable URL states, loading skeletons, explicit 403/404 pages.
- [ ] Admin UI: Category edit, product stock updates, order pagination.
- [ ] Cloudinary backend lifecycle: Validate size/MIME, conditional deletion of old images on product update.

### ⏳ Phase 10 & 12: E2E Acceptance & Docs Audit
- **Branch:** `feature/phase-10-12-acceptance-docs`
- [ ] Split large Playwright tests into repeatable, focused specs.
- [ ] Final documentation reconciliation (`README.md`, correct instructions).
- [ ] Definition of Done checklist.
