-- Development seed data for Research Publishing OS.
-- Apply with:
--   psql -U rpos -d rpos < database/seeds/dev-seed.sql
--   or run: pnpm --filter @rpos/database run seed

INSERT INTO publishers (id, name, slug, website, "createdAt", "updatedAt")
VALUES ('pub-demo', 'Research Publishing OS Consortium', 'demo-publisher', 'https://researchos.io', now(), now())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, website = EXCLUDED.website;

-- 10 Academic Journals
INSERT INTO journals (id, "publisherId", title, slug, issn, description, "createdAt", "updatedAt")
VALUES
  ('journal-demo', 'pub-demo', 'Journal of Demonstrable Results', 'jdr', NULL, 'Open science and reproducible results.', now(), now()),
  ('journal-ai-systems', 'pub-demo', 'International Journal of Artificial Intelligence & Autonomous Systems', 'ijaias', '2768-4521', 'Peer-reviewed scholarly periodical in deep learning, neural-symbolic architectures, autonomous robotics, and ethical machine intelligence. Publication frequency: Quarterly. Annual volume archival close date: December 31, 2026.', now(), now()),
  ('journal-quantum-comp', 'pub-demo', 'Journal of Quantum Information and Computing', 'jqic', '2769-1020', 'High-impact theoretical and experimental research in fault-tolerant quantum algorithms, superconducting qubits, and quantum complexity theory. Volume archival close date: December 31, 2026.', now(), now()),
  ('journal-genomic-med', 'pub-demo', 'Applied Biotechnology and Genomic Medicine', 'abgm', '2770-5534', 'Translational CRISPR therapeutics, single-cell spatial transcriptomics, synthetic biology, and computational oncology. Bimonthly volume ending December 31, 2026.', now(), now()),
  ('journal-clean-energy', 'pub-demo', 'Transactions on Sustainable Clean Energy & Grid Systems', 'tsce', '2771-8890', 'Perovskite photovoltaics, solid-state battery chemistry, green hydrogen electrolysis, and smart microgrid optimization. Final annual publication end date: December 20, 2026.', now(), now()),
  ('journal-cyber-crypto', 'pub-demo', 'Journal of Advanced Cybersecurity & Cryptography', 'jacc', '2772-3341', 'Post-quantum cryptographic primitives, zero-knowledge proofs, hardware security enclaves, and formal protocol verification. Quarterly publication ending December 15, 2026.', now(), now()),
  ('journal-neuro-cog', 'pub-demo', 'Neural Computing and Cognitive Brain Research', 'nccbr', '2773-9922', 'Biological neural dynamics, neuromorphic computing, high-density brain-computer interfaces, and neural prosthetics. Volume close end date: November 30, 2026.', now(), now()),
  ('journal-nano-eng', 'pub-demo', 'Journal of Nanomaterials and Molecular Engineering', 'jnme', '2774-7715', '2D transition metal dichalcogenides, MXenes, carbon nanotube composites, and molecular self-assembly. Issue 4 publication end date: December 28, 2026.', now(), now()),
  ('journal-comp-ling', 'pub-demo', 'Computational Linguistics & Natural Language Intelligence', 'clnli', '2775-6638', 'Foundational multilingual language models, syntactic parsing, semantic reasoning, and mechanistic interpretability. Volume closing end date: December 31, 2026.', now(), now()),
  ('journal-climate-sys', 'pub-demo', 'Frontiers in Climate Systems & Environmental Informatics', 'fcsei', '2776-4429', 'High-resolution earth system modeling, satellite remote sensing, paleoclimate reconstruction, and geospatial machine learning. Volume end date: December 31, 2026.', now(), now()),
  ('journal-biomed-eng', 'pub-demo', 'Biomedical Engineering & Translational Healthcare', 'beth', '2777-1184', 'Biocompatible implants, organ-on-a-chip microfluidics, robot-assisted surgical navigation, and real-time physiological biosensors. Annual volume completion end date: December 31, 2026.', now(), now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  issn = EXCLUDED.issn,
  description = EXCLUDED.description;

-- 10 Conferences with startsAt and endsAt
INSERT INTO conferences (id, "publisherId", title, slug, location, "startsAt", "endsAt", "createdAt", "updatedAt")
VALUES
  ('conf-iclas-2026', 'pub-demo', 'International Conference on Learning Representations & Autonomous Systems', 'iclas-2026', 'San Francisco, USA', '2026-05-10 09:00:00+00', '2026-05-15 18:00:00+00', now(), now()),
  ('conf-qip-2026', 'pub-demo', 'Global Symposium on Quantum Information Processing & Computing', 'qip-2026', 'Geneva, Switzerland', '2026-06-20 09:00:00+00', '2026-06-25 18:00:00+00', now(), now()),
  ('conf-wcbg-2026', 'pub-demo', 'World Congress on Translational Biotechnology & Gene Therapy', 'wcbg-2026', 'Boston, USA', '2026-07-14 08:30:00+00', '2026-07-18 17:30:00+00', now(), now()),
  ('conf-isreg-2026', 'pub-demo', 'International Summit on Renewable Energy & Grid Integration', 'isreg-2026', 'Tokyo, Japan', '2026-08-05 09:00:00+00', '2026-08-09 18:00:00+00', now(), now()),
  ('conf-accns-2026', 'pub-demo', 'Annual Conference on Cryptography & Network Security', 'accns-2026', 'Berlin, Germany', '2026-09-12 09:00:00+00', '2026-09-16 18:00:00+00', now(), now()),
  ('conf-iccsn-2026', 'pub-demo', 'International Conference on Cognitive Systems & Neurotechnology', 'iccsn-2026', 'Zurich, Switzerland', '2026-10-18 09:00:00+00', '2026-10-22 18:00:00+00', now(), now()),
  ('conf-anwf-2026', 'pub-demo', 'Advanced Nanomaterials World Forum & Exposition', 'anwf-2026', 'Singapore', '2026-11-04 09:00:00+00', '2026-11-08 18:00:00+00', now(), now()),
  ('conf-gcclai-2026', 'pub-demo', 'Global Conference on Computational Linguistics & AI', 'gcclai-2026', 'Edinburgh, UK', '2026-11-20 09:00:00+00', '2026-11-24 18:00:00+00', now(), now()),
  ('conf-iccri-2026', 'pub-demo', 'International Colloquium on Climate Resilience & Informatics', 'iccri-2026', 'Vancouver, Canada', '2026-12-01 09:00:00+00', '2026-12-05 18:00:00+00', now(), now()),
  ('conf-wcbcr-2026', 'pub-demo', 'World Congress on Biomedical Engineering & Clinical Robotics', 'wcbcr-2026', 'Stockholm, Sweden', '2026-12-15 09:00:00+00', '2026-12-19 18:00:00+00', now(), now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  location = EXCLUDED.location,
  "startsAt" = EXCLUDED."startsAt",
  "endsAt" = EXCLUDED."endsAt";
