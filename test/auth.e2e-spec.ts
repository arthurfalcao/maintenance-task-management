import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { userStub } from './stubs/user.stub';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('/auth/login (POST)', () => {
    it('should return a token', async () => {
      await prismaService.user.create({
        data: userStub(),
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
        data: userStub(),
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
