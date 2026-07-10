-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_publisherId_key" ON "api_keys"("publisherId");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
