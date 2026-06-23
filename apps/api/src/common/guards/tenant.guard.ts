import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext as ExecCtx } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from './jwt-auth.guard';

export const SKIP_TENANT_KEY = 'skip-tenant';
export const SkipTenant = (): MethodDecorator & ClassDecorator =>
  SetMetadata(SKIP_TENANT_KEY, true);

export const CurrentOrg = createParamDecorator(
  (_data: unknown, ctx: ExecCtx): string => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    return req.user?.organizationId ?? '';
  },
);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecCtx): AuthenticatedUser | undefined => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    return req.user;
  },
);

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = req.user;
    if (!user) throw new ForbiddenException('Authentication required');

    const headerOrg = (req.headers['x-organization-id'] as string | undefined)?.trim();
    if (headerOrg && headerOrg !== user.organizationId) {
      throw new ForbiddenException('X-Organization-Id does not match authenticated user');
    }
    return true;
  }
}