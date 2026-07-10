-- CreateTable
CREATE TABLE "publisher_members" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publisher_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "publisher_members_userId_idx" ON "publisher_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "publisher_members_publisherId_userId_role_key" ON "publisher_members"("publisherId", "userId", "role");

-- AddForeignKey
ALTER TABLE "publisher_members" ADD CONSTRAINT "publisher_members_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publisher_members" ADD CONSTRAINT "publisher_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
