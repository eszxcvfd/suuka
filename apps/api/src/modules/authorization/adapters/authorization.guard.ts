import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthorizationPrincipal } from '@suuka/shared-types';
import { AuthorizationService } from '../application/authorization.service';
import { PERMISSIONS_METADATA_KEY, type PermissionMetadata } from './permissions.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<PermissionMetadata | undefined>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      throw new ForbiddenException('Missing required permissions metadata'); // default-deny
    }

    const request = context.switchToHttp().getRequest<{ authUser?: AuthorizationPrincipal }>();
    const principal = request.authUser;
    if (!principal) {
      throw new UnauthorizedException('Missing authenticated principal');
    }

    const decision = this.authorizationService.evaluate(principal, {
      action: metadata.action,
      requiredScopes: metadata.requiredScopes,
    });

    if (!decision.allowed) {
      if (principal.principalType === 'internal_service') {
        throw new ForbiddenException('Missing required scope grant');
      }
      throw new ForbiddenException('Missing required permissions metadata');
    }

    return true;
  }
}
