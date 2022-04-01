import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const mockPrismaService = () => ({
  user: {
    findUnique: jest.fn(),
  },
});

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const getUser = async (role: Role) => {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash('password', salt);

    const at = new Date();

    return {
      id: 'userId',
      email: 'email',
      role,
      password,
      name: 'name',
      createdAt: at,
      updatedAt: at,
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
        {
          provide: JwtService,
          useFactory: () => ({ sign: jest.fn() }),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signIn', () => {
    it('should return a token', async () => {
      const user = await getUser(Role.TECHNICIAN);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.signIn({
        email: 'johndoe@example.com',
        password: 'password',
      });

      expect(result.accessToken).toBe('token');
    });

    it('should throw an error when user is not found', async () => {
      const credentials = {
        email: 'johndoe@example.com',
        password: 'password',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error when password is incorrect', async () => {
      const credentials = {
        email: 'johndoe@example.com',
        password: 'wrong-password',
      };

      const user = await getUser(Role.TECHNICIAN);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
