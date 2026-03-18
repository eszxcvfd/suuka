import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../application/token.service';
import { UserRepository } from '../infrastructure/user.repository';
import type { AuthorizationPrincipal } from '@suuka/shared-types';

type RequestWithAuthUser = {
  authUser?: AuthorizationPrincipal;
  headers?: {
    authorization?: string;
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuthUser>();
    const authorization = request.headers?.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    let payload: Awaited<ReturnType<TokenService['verifyAccessToken']>>;
    try {
      payload = await this.tokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }

    if (payload.principalType === 'internal_service') {
      request.authUser = {
        id: payload.sub,
        principalType: 'internal_service',
        scopes: payload.scopes ?? [],
        serviceName: payload.serviceName,
        sessionId: payload.sessionId,
        status: 'active',
      };
      return true;
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    request.authUser = {
      id: String((user as unknown as { _id: unknown })._id),
      principalType: 'user',
      email: user.email,
      accountVisibility: user.accountVisibility,
      role: user.role,
      scopes: payload.scopes ?? [],
      sessionId: payload.sessionId,
      status: user.status,
      userId: String((user as unknown as { _id: unknown })._id),
    };
    return true;
  }
}
