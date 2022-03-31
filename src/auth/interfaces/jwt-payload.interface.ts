import { Role } from '@prisma/client';

export interface JwtPayload {
  email: string;
  role: Role;
}
