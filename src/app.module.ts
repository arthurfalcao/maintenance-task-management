import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationModule } from './notification/notification.module';

const environment = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${environment}`, `.env.${environment}.local`],
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
