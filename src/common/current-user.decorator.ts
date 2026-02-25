import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RequestUser } from './request-user';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const req = ctx.switchToHttp().getRequest();
    const id = req.headers['x-user-id'];
    const role = req.headers['x-user-role'] || 'CUSTOMER';

    if (!id || typeof id !== 'string') {
      throw new UnauthorizedException('x-user-id header is required for MVP');
    }

    return {
      id,
      role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
    };
  },
);
