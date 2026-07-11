-- CreateTable
CREATE TABLE "workflow_action_rules" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "roles" "UserRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_action_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_action_rules_publisherId_action_key" ON "workflow_action_rules"("publisherId", "action");

-- AddForeignKey
ALTER TABLE "workflow_action_rules" ADD CONSTRAINT "workflow_action_rules_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
