-- Development seed data. Apply with:
--   docker compose exec -T postgres psql -U rpos -d rpos < database/seeds/dev-seed.sql

INSERT INTO publishers (id, name, slug, "createdAt", "updatedAt")
VALUES ('pub-demo', 'Demo Publisher', 'demo-publisher', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO journals (id, "publisherId", title, slug, "createdAt", "updatedAt")
VALUES ('journal-demo', 'pub-demo', 'Journal of Demonstrable Results', 'jdr', now(), now())
ON CONFLICT (id) DO NOTHING;
