import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Multi-tenancy foundation: EDITOR and REVIEWER capability is now scoped per
// publisher via PublisherMember, rather than global. The seeded dev accounts
// were previously omniscient across every publisher's submissions; this
// backfill preserves that behavior for the existing demo/dev accounts and
// existing publishers only. Any publisher created after this point starts
// with no members — its owner must explicitly invite their own editors and
// reviewers, which is the actual point of tenant isolation.
const STAFF = [
  { email: 'editor@rpos.dev', role: 'EDITOR' },
  { email: 'reviewer@rpos.dev', role: 'REVIEWER' },
];

async function main() {
  const publishers = await prisma.publisher.findMany({ select: { id: true, name: true } });

  for (const { email, role } of STAFF) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`Skipping ${email} (no such user)`);
      continue;
    }
    for (const publisher of publishers) {
      await prisma.publisherMember.upsert({
        where: { publisherId_userId_role: { publisherId: publisher.id, userId: user.id, role } },
        update: {},
        create: { publisherId: publisher.id, userId: user.id, role },
      });
      console.log(`${email} is now ${role} member of "${publisher.name}"`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
