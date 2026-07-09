# Adding a Service

Copy the established shape — `services/journal` is a good reference. Checklist:

1. **Package**: `services/<name>/package.json` named `@rpos/service-<name>`,
   `"type": "module"`, scripts `build` (tsc), `dev` (tsx watch), `start`,
   `test` (vitest), `typecheck`, `clean`. `tsconfig.json` extends
   `config/typescript/base.json` with `rootDir: src`, `outDir: dist`.
   NodeNext ESM: relative imports need the `.js` extension.

2. **Store first** (`src/store.ts`): define the `XStore` interface and an
   `InMemoryXStore`. Add `src/prisma-store.ts` implementing the same
   interface. If you need new tables, edit
   `packages/database/prisma/schema.prisma` and run
   `pnpm --filter @rpos/database migrate:dev --name <change>`.

3. **App factory** (`src/app.ts`): `buildApp(options)` taking the store,
   `jwtSecret`, and any collaborators. Register `@fastify/jwt`, add the
   `authenticate` decorator, a `/health` route returning
   `{ status, service, uptime }`, and versioned routes under `/v1/...`.
   Validate bodies with schemas from `@rpos/validation` (add new schemas
   there, not locally, if the web app will need them too). Return 404 —
   never 403 — when hiding a resource the caller can't access.

4. **Composition root** (`src/index.ts`): `loadEnv(baseEnvSchema.extend(...))`
   from `@rpos/config`; port env var is **optional** and resolved with
   `findFreePort(env.X_PORT ?? <default>)` — never hard-bind a port. Wire the
   Prisma store, `logger: true`, listen on `0.0.0.0`.

5. **Tests** (`test/<name>.test.ts`): construct `buildApp` with the in-memory
   store, `await app.ready()`, mint JWTs with `app.jwt.sign(...)`, drive with
   `app.inject()`. Cover the role/ownership matrix and each error status.

6. **Wire the platform**:
   - `.env.example`: add `<NAME>_PORT` and, if the web app calls it,
     `<NAME>_API_URL`.
   - `services/api-gateway/src/app.ts`: add a proxy route entry (and its env
     default in the gateway's `index.ts`).
   - If it emits notifications, inject a `Notifier` (`@rpos/shared`) as an
     optional `buildApp` dependency defaulting to `NoopNotifier`.

7. **Verify**: `pnpm build && pnpm test`, then exercise the real service
   against Postgres (docker compose) before committing.
