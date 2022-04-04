import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsPort,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum EnvVariable {
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  QUEUE_URL = 'QUEUE_URL',
  QUEUE_NAME = 'QUEUE_NAME',
  JWT_SECRET = 'JWT_SECRET',
}

export type EnvVariables = typeof EnvVariable;

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsPort()
  PORT = '3000';

  @IsString()
  @IsNotEmpty()
  MYSQL_ROOT_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  MYSQL_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsPort()
  DB_PORT: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  QUEUE_URL: string;

  @IsString()
  @IsNotEmpty()
  QUEUE_NAME: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
