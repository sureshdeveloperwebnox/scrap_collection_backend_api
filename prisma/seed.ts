import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'Admin@123';
const ORG_NAME = 'Test Organization';

async function main() {
  const existing = await prisma.users.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.users.update({
      where: { email: ADMIN_EMAIL },
      data: { hashPassword: hash },
    });
    console.log('Seed: Updated password for', ADMIN_EMAIL);
    return;
  }

  const org = await prisma.organization.create({
    data: {
      name: ORG_NAME,
      email: ADMIN_EMAIL,
      isActive: true,
    },
  });

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.users.create({
    data: {
      email: ADMIN_EMAIL,
      firstName: 'Admin',
      lastName: 'User',
      hashPassword: hash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  console.log('Seed: Created admin user', ADMIN_EMAIL, 'with password', ADMIN_PASSWORD);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
