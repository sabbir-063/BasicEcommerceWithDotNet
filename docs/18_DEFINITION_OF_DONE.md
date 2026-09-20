# 18 - Definition of Done

The project is done only when all applicable checks below are true.

## Scope
- [ ] All features in `00_PROJECT_SCOPE.md` exist.
- [ ] No major out-of-scope feature was added without approval.
- [ ] COD is the only checkout payment method.
- [ ] Cart source of truth is PostgreSQL.
- [ ] Cancelled order flow exists.

## Backend
- [ ] .NET 10 solution builds cleanly.
- [ ] Layer dependencies follow architecture.
- [ ] EF migrations exist and apply to fresh PostgreSQL.
- [ ] Development Neon migration applied successfully.
- [ ] JWT auth works.
- [ ] Role authorization works.
- [ ] Ownership checks prevent IDOR.
- [ ] Cloudinary upload works through backend.
- [ ] Checkout is transactional and stock-safe.
- [ ] Cancellation restores stock exactly once.
- [ ] Problem Details format is consistent.
- [ ] Health endpoints work.
- [ ] Swagger/OpenAPI works in Development.

## Frontend
- [ ] TypeScript strict build passes.
- [ ] No Redux.
- [ ] No unnecessary global Context store.
- [ ] All routes/pages exist.
- [ ] Loading/empty/error states exist.
- [ ] Public catalog is usable.
- [ ] Cart persists after refresh.
- [ ] Checkout succeeds.
- [ ] Orders/customer cancellation work.
- [ ] Admin category/product/order workflows work.
- [ ] Responsive checks pass.
- [ ] No important console errors.

## Testing
- [ ] Backend unit tests pass.
- [ ] Backend PostgreSQL integration tests pass.
- [ ] Frontend tests pass.
- [ ] Playwright core E2E passes.
- [ ] Real Neon smoke test passes.
- [ ] Real Cloudinary smoke test passes.
- [ ] Manual browser acceptance checklist passes.

## Security
- [ ] `info.txt` ignored by Git.
- [ ] No secrets in tracked source.
- [ ] No backend secrets in Vite environment.
- [ ] Passwords hashed.
- [ ] CORS exact origins configured.
- [ ] Upload type/size validated server-side.
- [ ] Dependency vulnerability checks reviewed.
- [ ] Unexpected errors do not expose stack traces to production client.

## Docker
- [ ] Frontend Docker image builds.
- [ ] Backend Docker image builds.
- [ ] Compose starts both.
- [ ] Containerized browser smoke flow passes.
- [ ] Backend respects `PORT` and binds on `0.0.0.0` for Render.

## Documentation
- [ ] Root README has setup commands.
- [ ] Required env values documented without real secrets.
- [ ] Migration/seed commands documented.
- [ ] Test commands documented.
- [ ] Docker commands documented.
- [ ] Deployment guide updated to match final code.
- [ ] Asset sources recorded when external demo images are used.
- [ ] `IMPLEMENTATION_STATUS.md` shows completed tests/evidence.

## Production readiness gate
Before deploying, STOP and request/confirm production values. Do not silently reuse development values.
