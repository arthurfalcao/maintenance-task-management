import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';

import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@Auth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @Roles(Role.MANAGER, Role.TECHNICIAN)
  getTasks(@GetUser() user: User) {
    return this.tasksService.getTasks(user);
  }

  @Post()
  @Roles(Role.TECHNICIAN)
  createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    return this.tasksService.createTask(createTaskDto, user.id);
  }

  @Put(':id')
  @Roles(Role.TECHNICIAN)
  updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, updateTaskDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles(Role.MANAGER)
  deleteTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.deleteTask(id);
  }

  @Patch(':id/perform')
  @Roles(Role.TECHNICIAN)
  performTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.performTask(id);
  }
}
