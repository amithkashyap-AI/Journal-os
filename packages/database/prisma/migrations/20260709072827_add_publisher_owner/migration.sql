-- AlterTable
ALTER TABLE "publishers" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "publishers_ownerId_idx" ON "publishers"("ownerId");

-- AddForeignKey
ALTER TABLE "publishers" ADD CONSTRAINT "publishers_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
