# 14 - Coding Standards

## General
- Prefer clarity over cleverness.
- Keep functions focused.
- Avoid premature abstraction.
- Remove dead code and commented-out experiments.
- Treat warnings intentionally; do not blanket-disable analyzers.
- Use descriptive names.
- No secrets or credentials in source.
- Comments explain why, not obvious syntax.

## C# / .NET

### Style
- nullable reference types enabled;
- implicit usings acceptable;
- async all the way for I/O;
- suffix async methods with `Async`;
- pass `CancellationToken` through request/service/DB/external calls;
- use records for immutable DTOs where convenient;
- use `decimal` for money;
- use `DateTimeOffset` for timestamps;
- use enums/domain types internally and explicit string serialization policy in API.

### Controllers
- thin;
- no EF queries directly if they contain business logic;
- no manual role parsing when authorization attributes/policies work;
- return appropriate `ActionResult<T>`.

### EF Core
- fluent configurations in Infrastructure;
- no lazy loading;
- explicit includes/projections;
- `AsNoTracking` reads;
- pagination before materialization;
- cancellation tokens on async DB calls;
- transactions around checkout/cancellation.

### Dependency injection
Use constructor injection. Avoid service locator patterns and static mutable service state.

### Configuration
Bind strongly typed options:
```text
JwtOptions
CloudinaryOptions
CorsOptions
SeedOptions
```

Validate required options on startup without leaking values.

## TypeScript / React

### TypeScript
- `strict: true`;
- avoid `any`; use `unknown` + narrowing at boundaries;
- central API types;
- do not duplicate inconsistent response types in many pages;
- use `type`/`interface` consistently according to team convention.

### React
- functional components;
- hooks at top level;
- no state update during render;
- no huge page components; split by responsibility;
- avoid unnecessary effects;
- server fetch actions in API modules;
- route pages orchestrate feature components.

### Naming
- Components: PascalCase;
- hooks: `useX`;
- API files: `feature.api.ts`;
- type files: `feature.types.ts`;
- utility functions: camelCase.

### Styling
Use Tailwind classes consistently. Extract reusable class-heavy UI primitives when duplication is meaningful.

Avoid inline style except truly dynamic numeric style cases.

## Formatting/linting
Backend:
- `dotnet format` configured or used before completion.

Frontend:
- ESLint;
- Prettier if included; if not, configure ESLint formatting policy consistently.

Do not create conflicting formatter configurations.

## Commit hygiene
If Codex performs Git commits:
- never commit `info.txt` or `.env.local`;
- one logical feature per commit when practical;
- conventional prefixes acceptable: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.

## API compatibility
Once frontend is integrated with an endpoint, changing its shape requires updating:
- API DTO;
- OpenAPI if generated;
- frontend types/client;
- tests;
- docs when contract-level behavior changes.

## Quality rule
Do not mark a feature complete because code compiles. It must pass its acceptance tests and browser verification.
