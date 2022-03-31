import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
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
    it('calls PrismaService.task.findMany with userId when user is TECHNICIAN', async () => {
      const mockTask = {
        title: 'Task title',
        summary: 'Task summary',
        id: 'someId2',
        userId: 'someId',
        performedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: 'someId',
        email: 'email',
        role: Role.TECHNICIAN,
        password: 'password',
        name: 'name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFindMany = jest
        .spyOn(prismaService.task, 'findMany')
        .mockResolvedValue([mockTask]);

      const result = await service.getTasks(mockUser);
      expect(result).toEqual([mockTask]);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 'someId' },
      });
    });

    it('calls PrismaService.task.findMany without userId when user is MANAGER', async () => {
      const mockTask = {
        title: 'Task title',
        summary: 'Task summary',
        id: 'someId2',
        userId: 'someId2',
        performedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUser = {
        id: 'someId',
        email: 'email',
        role: Role.MANAGER,
        password: 'password',
        name: 'name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFindMany = jest
        .spyOn(prismaService.task, 'findMany')
        .mockResolvedValue([mockTask]);

      const result = await service.getTasks(mockUser);
      expect(result).toEqual([mockTask]);
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: undefined },
      });
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
        userId: 'userId',
        performedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createTask(task, 'someId');
      expect(result.title).toEqual(task.title);
      expect(result.summary).toEqual(task.summary);
      expect(result.performedAt).toBeNull();
      expect(result.userId).toBe('userId');
    });
  });

  describe('updateTask', () => {
    it('should be able to update a task', async () => {
      const task = {
        id: 'someId',
        title: 'Task title',
        summary: 'Task summary',
        userId: 'userId',
        performedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        title: 'Task',
      };

      jest.spyOn(prismaService.task, 'update').mockResolvedValue({
        ...task,
        ...updatedTask,
      });

      const result = await service.updateTask('someId', updatedTask);
      expect(result.title).toEqual(updatedTask.title);
      expect(result.createdAt).toBe(task.createdAt);
    });

    it('should throw a not found error if the task is not found', async () => {
      jest
        .spyOn(prismaService.task, 'update')
        .mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError(
            'message',
            'P2025',
            'clientVersion',
          ),
        );

      await expect(service.updateTask('someId', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if the task does not exist', async () => {
      jest.spyOn(prismaService.task, 'update').mockRejectedValue(new Error());

      await expect(service.updateTask('someId', {})).rejects.toThrowError();
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

    it('should throw a not found error if the task does not exist', async () => {
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

    it('should throw an error if the task does not exist', async () => {
      jest.spyOn(prismaService.task, 'delete').mockRejectedValue(new Error());

      await expect(service.deleteTask('someId')).rejects.toThrowError();
    });
  });
});
