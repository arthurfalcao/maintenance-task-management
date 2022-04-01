import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const userStub = (
  options?: Partial<Prisma.UserCreateInput>,
): Prisma.UserCreateInput => {
  return {
    ...(options || {}),
    email: options?.email ?? 'johndoe@example.com',
    password: bcrypt.hashSync(options?.password ?? 'password', 10),
    name: options?.name ?? 'John Doe',
    role: options?.role ?? Role.TECHNICIAN,
  };
};
