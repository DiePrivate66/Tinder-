import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { REQUIRED_PERMISSIONS_KEY } from '../auth/require-permissions.decorator';

type AuthenticatedRequest = Request & { user?: AuthUser };

@Injectable()
export class GatewayPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const grantedPermissions = new Set(req.user?.permissions ?? []);
    const hasEveryPermission = requiredPermissions.every((permission) =>
      grantedPermissions.has(permission),
    );

    if (!hasEveryPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
