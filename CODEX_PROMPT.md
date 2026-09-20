# Ready-to-paste Codex Prompt

Read `CODEX_START_HERE.md`, then read every referenced file under `docs/` before writing application code. Also read root `info.txt` for development configuration, but never print, expose, or commit any secret from it.

Build the complete e-commerce MVP described by the docs. Create the required `front/` and `back/` folders, project files, database migrations, Dockerfiles, root `docker-compose.yml`, tests, and final root README. Follow `docs/11_IMPLEMENTATION_ORDER.md` feature-by-feature rather than generating the entire project without verification.

For each feature slice, implement backend and frontend integration, run build/lint/tests, start the real application, and use your browser capability to verify the user flow and network behavior. Use the development Neon and Cloudinary credentials from `info.txt` for real integration smoke tests. Keep automated database tests isolated with disposable PostgreSQL where appropriate so you do not destructively reset the provided Neon database.

Maintain `docs/IMPLEMENTATION_STATUS.md` throughout the work and record test evidence. Use `docs/20_API_UI_MAPPING.md` to ensure every backend endpoint is integrated into the correct frontend page. Follow the security, error handling, coding style, transaction, stock concurrency, cancellation, and asset sourcing rules in the docs.

Do not add Redux. Do not add a global React Context store unless an unavoidable reason is documented; the planned implementation does not require one. Checkout is Cash on Delivery only. Cart must be stored in PostgreSQL. Images must be uploaded through the backend to Cloudinary. Frontend and backend must both be Dockerized.

Do not deploy to production. Prepare the project for Vercel (frontend), Render (backend), Neon (PostgreSQL), and Cloudinary, but stop before production deployment because new production credentials will be supplied later.

If a required development value is missing or still has a placeholder in `info.txt`, report only the missing KEY NAME, not any existing secret values. Otherwise continue autonomously until the Definition of Done is satisfied or a genuine external blocker requires owner action.
