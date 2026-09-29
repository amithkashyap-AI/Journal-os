-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "round" INTEGER NOT NULL DEFAULT 1;

-- DropIndex
DROP INDEX IF EXISTS "reviews_submissionId_reviewerId_key";

-- CreateIndex
CREATE UNIQUE INDEX "reviews_submissionId_reviewerId_round_key" ON "reviews"("submissionId", "reviewerId", "round");

-- CreateIndex
CREATE INDEX "reviews_reviewerId_submittedAt_idx" ON "reviews"("reviewerId", "submittedAt");

-- CreateIndex
CREATE INDEX "submissions_authorId_createdAt_idx" ON "submissions"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "journals_publisherId_idx" ON "journals"("publisherId");
