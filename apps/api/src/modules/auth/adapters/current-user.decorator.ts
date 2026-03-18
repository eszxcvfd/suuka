import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthorizationPrincipal } from '@suuka/shared-types';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthorizationPrincipal | null => {
    const request = context.switchToHttp().getRequest<{ authUser?: AuthorizationPrincipal }>();
    return request.authUser ?? null;
  },
);
