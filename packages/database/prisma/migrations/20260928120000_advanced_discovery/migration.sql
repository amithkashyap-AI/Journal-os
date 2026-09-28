ALTER TABLE "journal_indexing_evidence" ADD COLUMN "coverageStartYear" INTEGER, ADD COLUMN "coverageEndYear" INTEGER;
CREATE TABLE "journal_publication_profiles" (
  "journalId" TEXT PRIMARY KEY REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "categories" TEXT[] NOT NULL,
  "feeModel" TEXT NOT NULL,
  "accessModel" TEXT NOT NULL,
  "publicationWeeks" INTEGER,
  "sourceUrl" TEXT NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL,
  "notes" TEXT NOT NULL,
  "verifiedBy" TEXT NOT NULL
);
