# 08 - Authentication and Security

## Threat model for this MVP
Protect against the most common application mistakes:
- plaintext/weak password storage;
- privilege escalation;
- IDOR / cross-user order access;
- trusting client totals/prices/roles;
- leaked credentials;
- unrestricted CORS;
- unsafe file uploads;
- SQL injection;
- XSS through unsafe rendering;
- brute-force login abuse;
- oversharing exception details.

## Passwords
- Use ASP.NET Core PasswordHasher/Identity password hashing.
- Never store plaintext or reversible passwords.
- Set a sensible development/production password policy.
- Seed admin password from secret config only.
- Never include seed password in logs.

## JWT
Claims should include at minimum:
- subject/user ID;
- email or name if useful;
- role;
- issuer/audience/expiration.

Validate:
- signature;
- issuer;
- audience;
- expiration;
- configured clock skew kept small.

The signing secret must be backend-only.

## Frontend token storage tradeoff
For this MVP, bearer access token may be stored in `sessionStorage` so the frontend and backend can run on separate Vercel/Render domains without relying on cross-site cookies.

Rules:
- no refresh token;
- short lifetime configured (default 60 minutes);
- clear on logout;
- clear on invalid/expired token;
- never log token;
- frontend must not render untrusted HTML with `dangerouslySetInnerHTML`.

Future hardening option: move to a same-site/custom-domain architecture with short-lived access token plus secure HttpOnly refresh-cookie rotation. This is explicitly outside MVP unless requested.

## Authorization
Backend is authoritative.

Never accept these from public client as trusted values:
- role;
- user ID for ownership;
- order status;
- product price used for checkout;
- order total;
- admin flags.

## CORS
Development allowed origin:
- exact `FRONTEND_DEV_URL`.

Production:
- exact Vercel/custom frontend origin(s).

Do not use `AllowAnyOrigin` together with privileged APIs in production.

## SQL injection
Use EF Core parameterized queries/LINQ. If raw SQL is ever required, parameterize it. Never concatenate request values into SQL strings.

## XSS
React escapes text by default. Keep it that way.

Do not render product/admin text as HTML. Product description is plain text in MVP.

## File upload security
Server-side checks:
- authenticated Admin only;
- MIME allowlist: JPEG, PNG, WebP (and optionally GIF only if intentionally supported);
- max size about 5 MB;
- reject zero length;
- Cloudinary resource type image;
- generated public ID/folder rather than trusting full arbitrary path from client.

Do not rely solely on file extension.

## Rate limiting
If practical, apply conservative IP/user rate limits to:
- login;
- register;
- image upload.

Return `429` with safe message. Do not overcomplicate if hosting constraints make this difficult, but document what is implemented.

## Error privacy
Client `500` responses must not include:
- stack trace;
- SQL text containing values;
- connection strings;
- filesystem paths with secrets;
- internal exception messages that reveal implementation details.

## Dependency security
Before completion:
- run `dotnet list package --vulnerable` or current supported equivalent;
- run `npm audit` and inspect relevant production dependencies;
- fix high/critical issues when a compatible safe upgrade exists;
- document any unresolved issue with reason.

## HTTPS
Production URLs must be HTTPS. Cloudinary delivery URLs must use HTTPS.

## Secrets in Docker
Do not use Docker `ARG` for runtime secrets that may become image metadata/layers. Inject backend secrets at runtime through Render environment variables or secret mechanisms.
