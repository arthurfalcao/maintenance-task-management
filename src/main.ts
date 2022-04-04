import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { EnvVariable, EnvVariables } from './common/env.validation';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService<EnvVariables, true> =
    app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  prismaService.enableShutdownHooks(app);

  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>(EnvVariable.QUEUE_URL)],
      queue: configService.get<string>(EnvVariable.QUEUE_NAME),
      queueOptions: { durable: false },
    },
  });
  await app.startAllMicroservices();

  const port = configService.get(EnvVariable.PORT);
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
