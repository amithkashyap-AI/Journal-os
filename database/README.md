# Database

The Prisma schema and migrations live in [`packages/database`](../packages/database) so the
Prisma CLI can resolve its tooling from that package's `node_modules`.

This directory holds database assets that are not tied to the Prisma package:

- `seeds/` — seed data scripts
- `scripts/` — ad-hoc maintenance scripts
- `migrations/` — reserved for non-Prisma migrations (e.g. raw SQL run by ops)
