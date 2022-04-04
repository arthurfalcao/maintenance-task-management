import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { EnvVariable, EnvVariables } from '@/common/env.validation';

import { NOTIFICATION_SERVICE } from './constants';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_SERVICE,
        useFactory: async (
          configService: ConfigService<EnvVariables, true>,
        ) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>(EnvVariable.QUEUE_URL)],
            queue: configService.get(EnvVariable.QUEUE_NAME),
            queueOptions: { durable: false },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
