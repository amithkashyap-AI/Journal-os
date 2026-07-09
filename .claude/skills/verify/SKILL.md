---
name: verify
description: Build, launch, and drive the RPOS stack (Fastify services + Next.js apps) to verify changes end-to-end.
---

# Verifying RPOS changes

## Prerequisites
- Docker Postgres on host port **5433** (`rpos-postgres`; native Postgres owns 5432) and `rpos-redis` on 6379. If down: `open -a Docker`, then `docker compose up -d`.
- Root `.env` has `DATABASE_URL` (port 5433) and `JWT_SECRET`. Load with `set -a; source .env; set +a`.
- Seeded logins: `<role>@rpos.dev` / `password123` for admin, publisher, editor, reviewer, author, reader (`node database/seeds/seed-users.js`). Older seeds: grace/editor/reviewer/admin `@example.com`.

## Build & launch
```bash
pnpm build                       # turbo, all packages/services/apps
# services (run from each service dir so relative paths resolve):
(cd services/auth && node dist/index.js &)          # :4001
# same for submission :4002, review :4003, journal :4005, file-storage :4006
# notification :4004 optional (notifier is fire-and-forget)
# apps (production):
(cd apps/web && ./node_modules/.bin/next start -p 3000 &)
(cd apps/landing && ./node_modules/.bin/next start -p 3001 &)
(cd apps/author && ./node_modules/.bin/next start -p 3002 &)
(cd apps/reviewer && ./node_modules/.bin/next start -p 3003 &)
```
Services prefer their env port but fall back via `findFreePort()` — check the log line for the actual port if something else is bound.

## Drive
Next pages are SSR; you can drive them with curl by injecting the session cookie directly:
```bash
TOK=$(curl -s http://localhost:4001/v1/auth/login -H 'content-type: application/json' \
  -d '{"email":"author@rpos.dev","password":"password123"}' | node -p "JSON.parse(require('fs').readFileSync(0)).accessToken")
curl -s http://localhost:3002/dashboard -H "Cookie: rpos_token=$TOK"   # renders full HTML
```
Flows worth driving: author portal login → dashboard → /submissions/new (journal options populated); reviewer portal dashboard; web /dashboard/admin as admin (307 → /dashboard for non-admins); unauthenticated pages 307 → /login.

## Gotchas
- **Stale dev servers**: previous agent sessions leave `next dev` processes holding 3000–3003 and corrupting `.next` (prod `next start` then 500s with `Cannot find module './vendor-chunks/...'`). Check `lsof -nP -iTCP:3000 -sTCP:LISTEN`, kill stale ones, `rm -rf apps/*/.next`, rebuild.
- **Stale services on 4000–4006**: same for service processes. Fresh services then silently bind 4007+ (findFreePort) and your requests hit the stale code on the canonical port. Before starting, `lsof -nP -iTCP:4000-4009 -sTCP:LISTEN` and kill leftovers; after starting, grep the logs for the actual bound port.
- **.env drift**: services only send notifications when `NOTIFICATION_API_URL` + `INTERNAL_API_SECRET` are set (otherwise `createNotifier()` is a silent no-op). Compare `.env` against `.env.example` when a flow mysteriously produces nothing.
- Fastify 400s any POST that has a JSON content-type and an empty body — always send `-d '{}'` when curling POST endpoints with no payload.
- Shell redirects to `/tmp` are sandboxed silently — write logs to the session scratchpad.
- Kill everything you started when done (`kill <pids>`); don't leave servers running.
