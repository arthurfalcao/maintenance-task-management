import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

import { userStub } from './stubs/user.stub';
import { clearDatabase } from './helpers/clear-database.helper';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await clearDatabase(prismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return a token', async () => {
      await prismaService.user.create({
        data: userStub({ email: 'johndoe@example.com' }),
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'johndoe@example.com', password: 'password' })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });

    it('should return unauthorized when user is not found', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'johndoe@example.com', password: 'password' })
        .expect(401)
        .expect((res) => {
          expect(res.body.accessToken).not.toBeDefined();
        });
    });

    it('should return unauthorized when password is incorrect', async () => {
      await prismaService.user.create({
        data: userStub({ email: 'johndoe@example.com' }),
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'johndoe@example.com', password: 'wrongPassword' })
        .expect(401)
        .expect((res) => {
          expect(res.body.accessToken).not.toBeDefined();
        });
    });
  });
});
