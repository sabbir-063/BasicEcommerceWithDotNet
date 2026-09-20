# 21 - Codex Agent Execution Rules

This file defines how an autonomous coding agent should execute the project, not just what code should exist.

## Before coding
- Read all project docs.
- Inspect current repository state; do not overwrite unrelated owner files.
- Validate tool versions.
- Validate required `info.txt` keys without echoing values.
- Verify `.gitignore` before generating any secret-bearing file.

## Work style
Implement one vertical slice at a time and test it immediately.

Bad sequence:
`write 100 files -> test everything at the end`.

Preferred sequence:
`foundation -> test -> auth -> test -> categories -> test -> media -> test -> products -> test -> cart -> test -> checkout -> test -> orders -> test`.

## Browser use
Use browser capability actively, not only automated HTTP tests.

For every user-facing feature:
1. open relevant page;
2. perform real interaction;
3. inspect visual result;
4. inspect console;
5. inspect failed Network requests;
6. fix issues;
7. repeat.

## Real service usage
Development credentials from `info.txt` are intentionally provided so integrations can be tested for real.

### Neon
Allowed:
- migrations;
- dev seed;
- normal development CRUD;
- smoke checkout/orders.

Not allowed without explicit designation:
- dropping/resetting an existing database;
- deleting all owner data;
- destructive experimentation.

### Cloudinary
Allowed:
- test uploads into configured development folder;
- seed/demo assets;
- delete assets created specifically by tests/seeding when tracked safely.

Not allowed:
- deleting arbitrary assets outside configured project folder;
- exposing secret to browser.

## Secret redaction
When reporting config status say:
- `NEON_DATABASE_URL_POOLED: present`
- `CLOUDINARY_API_SECRET: present`

Never show actual values.

## Dependency decisions
Prefer stable packages compatible with the chosen LTS runtimes. Avoid adding packages when platform/framework features already solve the problem clearly.

Before adding a package ask internally:
- Does the standard library/framework already provide this?
- Is it maintained?
- Is this dependency justified for MVP?

## Scope control
Do not spontaneously add:
- refresh tokens;
- payment gateway;
- reviews;
- wishlist;
- coupon engine;
- microservices;
- message queues;
- Kubernetes;
- event sourcing;
- GraphQL.

If architecture would benefit later, leave an extension point/document note instead of implementing out-of-scope complexity.

## Bug policy
When a test/browser check finds a bug:
1. reproduce;
2. identify root cause;
3. add/update automated regression test when valuable;
4. fix;
5. rerun nearest test group;
6. rerun browser scenario;
7. update status log.

Do not hide a bug by weakening/removing a valid test.

## Data policy
Do not fabricate backend success in frontend mocks once real API integration exists. Story/demo data may exist only where explicitly useful; final customer flows must use real backend.

## Completion report
When project build is complete, produce a concise final implementation report containing:
- implemented features;
- test commands and results;
- real Neon/Cloudinary smoke status without secrets;
- Docker build/run status;
- known limitations;
- exact production values still needed;
- deployment not performed unless explicitly requested.
