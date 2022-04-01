import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async getTasks(user: User) {
    return this.prismaService.task.findMany({
      where: {
        userId: user.role === Role.TECHNICIAN ? user.id : undefined,
      },
    });
  }

  async createTask(createTaskDto: CreateTaskDto, userId: string) {
    return this.prismaService.task.create({
      data: {
        ...createTaskDto,
        userId,
      },
    });
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.prismaService.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== user.id) {
      throw new NotFoundException(`Task '${id}' not found`);
    }

    const updatedTask = await this.prismaService.task.update({
      where: { id },
      data: updateTaskDto,
    });

    return updatedTask;
  }

  async deleteTask(id: string) {
    try {
      await this.prismaService.task.delete({
        where: { id },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`Task '${id}' not found`);
        }
      }
      throw err;
    }
  }

  async performTask(id: string) {
    const task = await this.prismaService.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task "${id}" not found`);
    }

    if (task.performedAt) {
      throw new BadRequestException(`Task "${id}" already performed`);
    }

    const updatedTask = await this.prismaService.task.update({
      where: { id },
      data: { performedAt: new Date() },
    });

    // TODO: notify managers

    return updatedTask;
  }
}
