import { SetMetadata } from '@nestjs/common';
import type { AuthorizationAction } from '../domain/permission-rule';

export interface PermissionMetadata {
  action: AuthorizationAction;
  requiredScopes?: string[];
}

export const PERMISSIONS_METADATA_KEY = 'authorization:permissions';

export function Permissions(action: AuthorizationAction, requiredScopes: string[] = []) {
  return SetMetadata(PERMISSIONS_METADATA_KEY, {
    action,
    requiredScopes,
  } satisfies PermissionMetadata);
}

export function InternalScopes(action: AuthorizationAction, requiredScopes: string[]) {
  return Permissions(action, requiredScopes);
}
