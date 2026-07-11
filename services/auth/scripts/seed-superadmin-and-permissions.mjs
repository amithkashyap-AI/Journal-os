import { getPrisma } from "@rpos/database";
import bcrypt from "bcryptjs";

const prisma = getPrisma();

// Mirrors @rpos/types' USER_ROLES and PERMISSIONS as plain literals — this
// is a standalone script, not part of the TS build graph.
const SYSTEM_ROLES = ["SUPERADMIN", "ADMIN", "PUBLISHER", "EDITOR", "REVIEWER", "AUTHOR", "READER"];

const PERMISSIONS = [
  { key: "journals.manage", description: "Create and edit journals & publisher organizations" },
  { key: "users.manage_roles", description: "Grant or revoke roles on other users (never ADMIN/SUPERADMIN itself)" },
  { key: "submissions.editorial", description: "Take editorial actions on submissions (start review, accept, reject, request revisions)" },
  { key: "reviews.assign", description: "Assign reviewers to submissions" },
];

async function main() {
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { key: role },
      update: {},
      create: { key: role, name: role.charAt(0) + role.slice(1).toLowerCase(), isSystem: true },
    });
    console.log(`System role: ${role}`);
  }

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
    });
    console.log(`Permission: ${permission.key}`);
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "superadmin@rpos.dev" },
    update: { roles: ["SUPERADMIN"] },
    create: {
      email: "superadmin@rpos.dev",
      name: "Superadmin User",
      passwordHash,
      roles: ["SUPERADMIN"],
    },
  });
  console.log("Bootstrapped superadmin@rpos.dev");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
