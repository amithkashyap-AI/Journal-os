import { getPrisma } from '../../packages/database/dist/index.js';
import bcrypt from 'bcryptjs';

const prisma = getPrisma();

const roles = ['ADMIN', 'PUBLISHER', 'EDITOR', 'REVIEWER', 'AUTHOR', 'READER'];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  for (const role of roles) {
    const email = `${role.toLowerCase()}@rpos.dev`;
    const name = `${role.charAt(0) + role.slice(1).toLowerCase()} User`;
    
    await prisma.user.upsert({
      where: { email },
      update: {
        roles: [role],
      },
      create: {
        email,
        name,
        passwordHash,
        roles: [role],
      },
    });
    console.log(`Upserted user: ${email} with role: ${role}`);
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
