CREATE TABLE "journal_editor_assignments" (
 "journalId" TEXT NOT NULL REFERENCES "journals"("id") ON DELETE CASCADE,
 "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("journalId", "userId")
);
CREATE INDEX "journal_editor_assignments_userId_idx" ON "journal_editor_assignments"("userId");
CREATE TABLE "journal_indexing_evidence" (
 "journalId" TEXT NOT NULL REFERENCES "journals"("id") ON DELETE CASCADE,
 "source" TEXT NOT NULL, "status" TEXT NOT NULL, "sourceUrl" TEXT NOT NULL,
 "checkedAt" TIMESTAMP(3) NOT NULL, "notes" TEXT NOT NULL, "verifiedBy" TEXT NOT NULL,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY ("journalId", "source")
);
CREATE TABLE "journal_assessments" (
 "journalId" TEXT PRIMARY KEY REFERENCES "journals"("id") ON DELETE CASCADE,
 "text" TEXT NOT NULL, "model" TEXT NOT NULL, "evidenceHash" TEXT NOT NULL,
 "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Existing publisher memberships are deliberately not converted into journal access.
-- Owners explicitly assign editors to individual journals after upgrading.
