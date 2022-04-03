import { PrismaPromise } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';

export const clearDatabase = async (prisma: PrismaService) => {
  const transactions: PrismaPromise<unknown>[] = [];
  transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`);

  const tableNames = await prisma.$queryRaw<
    { TABLE_NAME: string }[]
  >`SELECT TABLE_NAME from information_schema.TABLES WHERE TABLE_SCHEMA = 'tests';`;

  for (const { TABLE_NAME: tableName } of tableNames) {
    if (tableName !== '_prisma_migrations') {
      try {
        transactions.push(prisma.$executeRawUnsafe(`TRUNCATE ${tableName};`));
      } catch (error) {
        console.log({ error });
      }
    }
  }

  transactions.push(prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`);

  return prisma.$transaction(transactions);
};
