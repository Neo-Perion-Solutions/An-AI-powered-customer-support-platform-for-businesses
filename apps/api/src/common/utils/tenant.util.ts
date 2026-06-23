import { UnauthorizedException } from '@nestjs/common';

export interface TenantContext {
  organizationId: string;
  userId: string;
}

export function requireOrg(orgId: string | undefined | null): string {
  if (!orgId) throw new UnauthorizedException('Missing organization context');
  return orgId;
}

export function tenantFilter(orgId: string): { organizationId: string } {
  return { organizationId: orgId };
}

export function paginationParams(page?: number, pageSize?: number): { skip: number; take: number; page: number; pageSize: number } {
  const safePage = Math.max(1, Number(page ?? 1));
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize ?? 20)));
  return { skip: (safePage - 1) * safePageSize, take: safePageSize, page: safePage, pageSize: safePageSize };
}

export function paginatedResponse<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
