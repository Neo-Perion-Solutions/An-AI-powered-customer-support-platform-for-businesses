import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../guards/jwt-auth.guard';
import { AuditAction } from '@prisma/client';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SKIP_PATHS = ['/api/health', '/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const method = req.method.toUpperCase();
    if (!MUTATION_METHODS.has(method)) return next.handle();
    if (SKIP_PATHS.some((p) => req.path.startsWith(p))) return next.handle();

    return next.handle().pipe(
      tap({
        next: () => {
          this.writeLog(req, method, true).catch((err) =>
            this.logger.warn(`Audit write failed: ${(err as Error).message}`),
          );
        },
        error: () => {
          this.writeLog(req, method, false).catch(() => undefined);
        },
      }),
    );
  }

  private async writeLog(
    req: Request & { user?: AuthenticatedUser },
    method: string,
    success: boolean,
  ): Promise<void> {
    const user = req.user;
    if (!user?.organizationId) return;
    const action = this.mapAction(method);
    const entity = this.extractEntity(req.path);
    const entityId = (req.params?.['id'] as string | undefined) ?? null;

    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: user.id,
          action,
          entity,
          entityId,
          changes: {
            method,
            path: req.path,
            success,
            body: success ? this.safeBody(req.body) : null,
          },
          ipAddress: req.ip ?? null,
          userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
        },
      });
    } catch (err) {
      this.logger.warn(`Audit log write failed: ${(err as Error).message}`);
    }
  }

  private mapAction(method: string): AuditAction {
    switch (method) {
      case 'POST':
        return AuditAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.UPDATE;
    }
  }

  private extractEntity(path: string): string {
    const parts = path.split('/').filter(Boolean);
    // path: /api/<entity>/... -> take 2nd segment
    return parts[1] ?? 'unknown';
  }

  private safeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;
    const cloned: Record<string, unknown> = { ...(body as Record<string, unknown>) };
    for (const key of ['password', 'token', 'refreshToken', 'accessToken', 'secret']) {
      if (key in cloned) cloned[key] = '[REDACTED]';
    }
    return cloned;
  }
}
