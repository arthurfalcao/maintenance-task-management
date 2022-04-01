import { Prisma } from '@prisma/client';

export const taskStub = (
  options?: Partial<Prisma.TaskCreateWithoutUserInput | Prisma.TaskCreateInput>,
): Prisma.TaskCreateWithoutUserInput | Prisma.TaskCreateInput => {
  return {
    ...(options || {}),
    summary: options?.summary ?? 'Task summary',
    title: options?.title ?? 'Task title',
  };
};
