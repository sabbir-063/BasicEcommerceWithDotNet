# Codex E-commerce Development Pack

Place this pack at the repository root. Fill `info.txt` using `info.txt.example`, then tell Codex to start with `CODEX_START_HERE.md` and follow the docs in order.

This pack intentionally contains specifications and execution rules, not application source code. Codex is expected to create `front/`, `back/`, Docker configuration, migrations, tests, and the final project README.

## Development secrets you supply
The only external-service values required before implementation are:

### Neon
- `NEON_DATABASE_URL_POOLED`
- `NEON_DATABASE_URL_DIRECT`

### Cloudinary
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

### You generate locally
- `JWT_SECRET`
- `DEV_ADMIN_NAME`
- `DEV_ADMIN_EMAIL`
- `DEV_ADMIN_PASSWORD`

Vercel/Render tokens are not required to build and test locally. Production values should be new/rotated before deployment.
