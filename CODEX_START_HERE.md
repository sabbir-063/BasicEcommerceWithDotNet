# CODEX START HERE

This repository is intended to be built by Codex feature-by-feature using the specifications in `docs/`.

## Mission
Build a complete, production-ready MVP e-commerce application with:

- Frontend: React + Vite + TypeScript
- Backend: ASP.NET Core Web API on .NET 10 LTS
- Database: PostgreSQL on Neon
- Product images: Cloudinary
- Frontend production target: Vercel
- Backend production target: Render
- Frontend and backend both Dockerized
- Checkout: Cash on Delivery only
- Cart stored in PostgreSQL
- Customer and Admin roles
- No Redux and no React Context-based global state requirement

## First actions for Codex

1. Read every file in `docs/` before creating application code.
2. Read root `info.txt` for development credentials and configuration. Never print secret values in logs or responses.
3. Confirm `info.txt`, `.env*`, local secret files, generated certificates, and test artifacts containing credentials are excluded by `.gitignore`.
4. Create `front/` and `back/` according to the architecture docs.
5. Create/update `docs/IMPLEMENTATION_STATUS.md` as work progresses.
6. Implement tasks strictly in the order defined in `docs/11_IMPLEMENTATION_ORDER.md` unless a blocking dependency requires a small reordering.
7. After every feature slice:
   - run formatter/linter/build;
   - run relevant unit/integration tests;
   - start the application;
   - test the feature through the real browser;
   - verify API/network behavior;
   - update `docs/IMPLEMENTATION_STATUS.md` with evidence and remaining issues.
8. Use the development Neon and Cloudinary values from `info.txt` for real integration smoke tests. Do not use production credentials during development.
9. Do not deploy to production unless explicitly instructed. Production values will be different from development values.

## Non-negotiable rules

- Never expose Cloudinary API secret, database credentials, JWT signing secret, or admin password to the frontend bundle.
- Never commit `info.txt` or generated local environment files.
- Never store passwords in plaintext.
- Never trust price, stock, role, order total, or order status values supplied by the client.
- Checkout must re-read product prices and stock from PostgreSQL and perform order creation plus stock deduction atomically.
- Order items must store product name and unit-price snapshots.
- Product deletion is soft-disable by default.
- Order status transitions must be validated server-side.
- A customer can only access their own cart and orders.
- Admin endpoints require the Admin role.
- Use UTC timestamps in the database and API.
- API errors must use one consistent JSON problem format.
- All list endpoints must be paginated where data can grow.

## Reading order

1. `docs/00_PROJECT_SCOPE.md`
2. `docs/01_INFO_TXT_SPEC.md`
3. `docs/02_TECH_STACK.md`
4. `docs/03_ARCHITECTURE.md`
5. `docs/04_DATABASE_SCHEMA.md`
6. `docs/05_API_CONTRACT.md`
7. `docs/06_FRONTEND_SPEC.md`
8. `docs/07_BACKEND_SPEC.md`
9. `docs/08_AUTH_SECURITY.md`
10. `docs/09_CLOUDINARY_AND_ASSETS.md`
11. `docs/10_DOCKER_AND_LOCAL_DEV.md`
12. `docs/11_IMPLEMENTATION_ORDER.md`
13. `docs/12_TESTING_STRATEGY.md`
14. `docs/13_ERROR_HANDLING.md`
15. `docs/14_CODING_STANDARDS.md`
16. `docs/15_SEED_DATA.md`
17. `docs/16_DEPLOYMENT.md`
18. `docs/17_BROWSER_ACCEPTANCE_TESTS.md`
19. `docs/18_DEFINITION_OF_DONE.md`
20. `docs/19_REFERENCE_LINKS.md`
21. `docs/20_API_UI_MAPPING.md`
22. `docs/21_AGENT_EXECUTION_RULES.md`
23. `docs/22_PRODUCTION_VALUE_ROTATION.md`
24. `docs/23_UI_DESIGN_BRIEF.md`
25. `docs/ASSET_SOURCES.md`
26. `docs/IMPLEMENTATION_STATUS.md`

## Final expected root structure

```text
/
|-- front/
|-- back/
|-- docs/
|-- templates/
|-- info.txt                 # local only; never commit
|-- info.txt.example
|-- docker-compose.yml
|-- .gitignore
|-- README.md                # project README created by Codex
`-- CODEX_START_HERE.md
```

When a choice is not specified, prefer the simplest secure solution that keeps the MVP maintainable and testable. Do not add major features outside this scope without explicit approval.
