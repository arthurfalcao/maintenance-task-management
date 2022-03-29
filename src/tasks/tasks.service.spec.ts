import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

const mockPrismaService = () => ({
  task: {
    create: jest.fn(),
  },
});

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createTask', () => {
    it('should be able to create a task', async () => {
      const task = {
        title: 'Task title',
        summary: 'Task summary',
      };

      jest.spyOn(prismaService.task, 'create').mockResolvedValue({
        ...task,
        id: 'someId2',
        userId: 'someId',
        performedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createTask(task, 'someId');
      expect(result.title).toEqual(task.title);
      expect(result.summary).toEqual(task.summary);
      expect(result.performedAt).toBeNull();
      expect(result.userId).toBe('someId');
    });
  });
});
