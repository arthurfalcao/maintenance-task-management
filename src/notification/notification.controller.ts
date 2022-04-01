import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Task } from '@prisma/client';

interface Payload {
  task: Task;
  managers: string[];
}

@Controller()
export class NotificationController {
  #logger = new Logger();

  @EventPattern('performs')
  async getNotification(@Payload() payload: Payload) {
    const { managers, task } = payload;

    managers.forEach(() => {
      const date = new Date(task.performedAt).toLocaleString();

      this.#logger.log(
        `The tech "${task.userId}" performed the task "${task.id}" on date ${date}`,
      );
    });
  }
}
