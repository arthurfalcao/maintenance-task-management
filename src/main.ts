import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('QUEUE_URL')!],
      queue: configService.get<string>('QUEUE_NAME'),
      queueOptions: { durable: false },
    },
  });
  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
