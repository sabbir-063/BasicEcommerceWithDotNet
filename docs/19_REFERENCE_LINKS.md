# 19 - Official Reference Links

These references were checked during planning on 2026-09-20. Codex should prefer current official docs if behavior/version details have changed.

## .NET
- .NET support policy: https://dotnet.microsoft.com/en-us/platform/support/policy
- .NET 10 downloads: https://dotnet.microsoft.com/en-us/download/dotnet/10.0

Planning baseline: .NET 10 is the active LTS release. Do not switch to .NET 11 preview/RC unless the owner explicitly requests it.

## Node.js
- Node releases: https://nodejs.org/en/blog/release

Planning baseline: Node.js 24 is LTS. Prefer an LTS line for build reproducibility rather than the Current line.

## Vite
- Environment variables: https://vite.dev/guide/env-and-mode

Important: `VITE_*` values are exposed to client-side code. Never store secrets in them.

## Npgsql
- Connection string parameters: https://www.npgsql.org/doc/connection-string-parameters
- Basic usage/data source: https://www.npgsql.org/doc/basic-usage.html

Npgsql documents key/value connection strings; if Neon gives a PostgreSQL URI, normalize it safely when necessary.

## Neon
- Neon docs: https://neon.com/docs
- API connection URI reference: https://neon.com/docs/reference/api

Neon can provide pooled and direct connection URIs. The project uses pooled for application runtime and direct for migration/admin workflow where appropriate.

## Cloudinary
- .NET SDK: https://cloudinary.com/documentation/dotnet_integration
- Upload API: https://cloudinary.com/documentation/image_upload_api_reference
- Credential guide: https://cloudinary.com/documentation/developer_onboarding_faq_find_credentials

Cloudinary API secret must not be exposed in public client code.

## Render
- Web services: https://render.com/docs/web-services
- Docker: https://render.com/docs/docker
- Environment variables: https://render.com/docs/configure-environment-variables
- Docker secrets: https://render.com/docs/docker-secrets

Render web services must listen on an externally reachable interface (`0.0.0.0`) and should honor the `PORT` environment variable.

## Vercel
- Environment variables overview/settings: https://vercel.com/docs/environment-variables
- Vite React template: https://vercel.com/templates/template/vite-react

Use deployment environment variables for public frontend configuration; remember Vite public env values are bundled client-side.

## Unsplash
- License/terms: https://unsplash.com/terms
- Help on commercial/personal project use: https://help.unsplash.com/en/articles/2612315-can-i-use-unsplash-images-for-personal-or-commercial-projects

Use free/licensed images carefully. Avoid relying on images with problematic recognizable people, trademarks, logos, or protected artwork for commercial-looking demo content.
