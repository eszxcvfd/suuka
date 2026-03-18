import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface CurrentUserPayload {
  email: string;
  sub: string;
}

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): CurrentUserPayload | null => {
  const request = context.switchToHttp().getRequest<{ authUser?: CurrentUserPayload }>();
  return request.authUser ?? null;
});
