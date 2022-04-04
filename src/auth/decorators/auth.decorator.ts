import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from '@/auth/guards/roles.guard';

export const Auth = () =>
  applyDecorators(UseGuards(AuthGuard('jwt'), RolesGuard));
