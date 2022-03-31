import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser(role: Role) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('super-secret-password', salt);

  const email = `${role.toLowerCase()}@example.com`;

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: role.toLowerCase(),
      password: hashedPassword,
      role,
    },
  });
}

async function main() {
  const technician = await createUser(Role.TECHNICIAN);
  const manager = await createUser(Role.MANAGER);

  console.log({ technician, manager });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
