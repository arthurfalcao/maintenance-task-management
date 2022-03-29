import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';

const mockPrismaService = () => ({
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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

  describe('getTasks', () => {
    it('should be able to return the tasks', async () => {
      const mockTask = {
        title: 'Task title',
        summary: 'Task summary',
        id: 'someId2',
        userId: 'someId',
        performedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prismaService.task, 'findMany').mockResolvedValue([mockTask]);

      const result = await service.getTasks();
      expect(result).toEqual([mockTask]);
    });
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

  describe('deleteTask', () => {
    it('should be able to delete a task', async () => {
      const mockDeleteTask = jest
        .spyOn(prismaService.task, 'delete')
        .mockResolvedValue({
          title: 'Task title',
          summary: 'Task summary',
          id: 'someId2',
          userId: 'someId',
          performedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await service.deleteTask('someId');

      expect(mockDeleteTask).toHaveBeenCalled();
    });

    it('should throw an error if the task does not exist', async () => {
      jest
        .spyOn(prismaService.task, 'delete')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'message',
            'P2025',
            'clientVersion',
          ),
        );

      await expect(service.deleteTask('someId')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
