-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "submissions_status_publishedAt_idx" ON "submissions"("status", "publishedAt");
