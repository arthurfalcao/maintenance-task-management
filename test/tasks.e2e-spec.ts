import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { userStub } from './stubs/user.stub';
import { taskStub } from './stubs/task.stub';
import { randomUUID } from 'crypto';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    const deleteTask = prismaService.task.deleteMany();
    const deleteUser = prismaService.user.deleteMany();

    await prismaService.$transaction([deleteTask, deleteUser]);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('/tasks (GET)', () => {
    it('should return unauthorized if unauthenticated', () => {
      return request(app.getHttpServer()).get('/tasks').expect(401);
    });

    it('should only return tasks from the user', async () => {
      const user = await prismaService.user.create({
        data: userStub({
          tasks: {
            create: taskStub(),
          },
        }),
      });

      await prismaService.user.create({
        data: userStub({
          email: 'janedoe@example.com',
          tasks: {
            create: taskStub(),
          },
        }),
      });

      const accessToken = jwtService.sign({
        email: user.email,
        role: user.role,
      });

      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
        });
    });

    it('should return all tasks when the user is a manager', async () => {
      await prismaService.user.create({
        data: userStub({
          tasks: {
            create: taskStub(),
          },
        }),
      });

      await prismaService.user.create({
        data: userStub({
          email: 'janedoe@example.com',
          tasks: {
            create: taskStub(),
          },
        }),
      });

      const manager = await prismaService.user.create({
        data: userStub({
          email: 'manager@example.com',
          role: Role.MANAGER,
        }),
      });

      const accessToken = jwtService.sign({
        email: manager.email,
        role: manager.role,
      });

      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
        });
    });
  });

  describe('/tasks (POST)', () => {
    it('should return unauthorized if unauthenticated', () => {
      return request(app.getHttpServer()).post('/tasks').expect(401);
    });

    it('should create a task', async () => {
      const user = await prismaService.user.create({
        data: userStub(),
      });

      const accessToken = jwtService.sign({
        email: user.email,
        role: user.role,
      });

      const task = taskStub();

      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(task)
        .expect(201)
        .expect((res) => {
          expect(res.body.userId).toBe(user.id);
          expect(res.body.title).toBe(task.title);
          expect(res.body.summary).toBe(task.summary);
        });
    });

    it('should return a 403 if the user is a manager', async () => {
      const user = await prismaService.user.create({
        data: userStub({ role: Role.MANAGER }),
      });

      const accessToken = jwtService.sign({
        email: user.email,
        role: user.role,
      });

      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskStub())
        .expect(403);
    });
  });

  describe('/tasks/:id (PUT)', () => {
    it('should return unauthorized if unauthenticated', () => {
      return request(app.getHttpServer())
        .put(`/tasks/${randomUUID()}}`)
        .expect(401);
    });

    it('should update a task', async () => {
      const user = await prismaService.user.create({
        data: userStub({
          tasks: {
            create: taskStub(),
          },
        }),
        include: { tasks: true },
      });

      const accessToken = jwtService.sign({
        email: user.email,
        role: user.role,
      });

      const task = taskStub({
        title: 'New title',
        summary: 'New summary',
      });

      return request(app.getHttpServer())
        .put(`/tasks/${user.tasks[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(task)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe(task.title);
          expect(res.body.summary).toBe(task.summary);
        });
    });

    it('should return a 403 if the user is a manager', async () => {
      const user = await prismaService.user.create({
        data: userStub({
          role: Role.MANAGER,
          tasks: {
            create: taskStub(),
          },
        }),
        include: { tasks: true },
      });

      const accessToken = jwtService.sign({
        email: user.email,
        role: user.role,
      });

      return request(app.getHttpServer())
        .put(`/tasks/${user.tasks[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskStub())
        .expect(403);
    });

    it("should return a 404 if the task doesn't exists", async () => {
      const user = await prismaService.user.create({
        data: userStub(),
      });

      const accessToken = jwtService.sign({
        email: user.email,
        role: user.role,
      });

      return request(app.getHttpServer())
        .put(`/tasks/${randomUUID()}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskStub())
        .expect(404);
    });

    it('should return a 404 if the task is from another user', async () => {
      const user = await prismaService.user.create({
        data: userStub(),
      });

      const user2 = await prismaService.user.create({
        data: userStub({
          tasks: {
            create: taskStub(),
          },
        }),
        include: { tasks: true },
      });

      const accessToken = jwtService.sign({
        email: user.email,
        role: user.role,
      });

      return request(app.getHttpServer())
        .put(`/tasks/${user2.tasks[0].id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(taskStub())
        .expect(404);
    });
  });
});
