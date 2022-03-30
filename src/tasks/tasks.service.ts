import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async getTasks() {
    return this.prismaService.task.findMany();
  }

  async createTask(createTaskDto: CreateTaskDto, userId: string) {
    return this.prismaService.task.create({
      data: {
        ...createTaskDto,
        userId,
      },
    });
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
    try {
      const updatedTask = await this.prismaService.task.update({
        where: { id },
        data: updateTaskDto,
      });

      return updatedTask;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`Task "${id}" not found`);
        }
      }
      throw err;
    }
  }

  async deleteTask(id: string) {
    try {
      await this.prismaService.task.delete({
        where: { id },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`Task "${id}" not found`);
        }
      }
      throw err;
    }
  }
}
