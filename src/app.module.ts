import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationModule } from './notification/notification.module';

const isTesting = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: isTesting ? '.env.test' : '.env',
      isGlobal: true,
      expandVariables: true,
    }),
    PrismaModule,
    AuthModule,
    TasksModule,
    NotificationModule,
  ],
})
export class AppModule {}
