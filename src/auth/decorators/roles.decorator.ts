import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '@/auth/constants';

export const Roles = (...args: string[]) => SetMetadata(ROLES_KEY, args);
