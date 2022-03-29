import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

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
}
