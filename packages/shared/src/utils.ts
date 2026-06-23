import type { PaginationInput } from './types';
import type { PermissionKey } from './rbac';
import { isPrivilegedRole, roleHasPermission } from './rbac';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_DEFAULT_PAGE, PAGINATION_MAX_LIMIT } from './constants';

export function paginationParams(
  page: number | string | undefined,
  limit: number | string | undefined,
): PaginationInput {
  const parsedPage = Math.max(PAGINATION_DEFAULT_PAGE, Number(page) || PAGINATION_DEFAULT_PAGE);
  const parsedLimit = Math.min(
    PAGINATION_MAX_LIMIT,
    Math.max(1, Number(limit) || PAGINATION_DEFAULT_LIMIT),
  );
  return { page: parsedPage, limit: parsedLimit };
}

export function paginationOffset(input: PaginationInput): number {
  return (input.page - 1) * input.limit;
}

export function paginationTotalPages(total: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.max(1, Math.ceil(total / limit));
}

export function formatCurrency(
  amountInMinorUnits: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  const major = (amountInMinorUnits ?? 0) / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(major);
  } catch {
    return `${currency.toUpperCase()} ${major.toFixed(2)}`;
  }
}

export function formatNumber(value: number, locale: string = 'en-US'): string {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat(locale).format(value);
}

const RTF_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

export function formatRelativeTime(
  input: string | number | Date,
  locale: string = 'en-US',
  now: Date = new Date(),
): string {
  const date = input instanceof Date ? input : new Date(input);
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 5) return 'just now';
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, secondsInUnit] of RTF_UNITS) {
    if (abs >= secondsInUnit || unit === 'second') {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return formatter.format(diffSeconds, 'second');
}

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function truncate(input: string, maxLength: number, suffix: string = '...'): string {
  if (maxLength <= 0) return '';
  if (input.length <= maxLength) return input;
  const cut = Math.max(0, maxLength - suffix.length);
  return input.slice(0, cut) + suffix;
}

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isAdmin(roleName: string | null | undefined): boolean {
  return isPrivilegedRole(roleName ?? '');
}

export function isOwner(roleName: string | null | undefined): boolean {
  return roleName === 'OWNER';
}

export function hasPermission(
  roleName: string | null | undefined,
  permission: PermissionKey,
): boolean {
  if (!roleName) return false;
  return roleHasPermission(roleName as Parameters<typeof roleHasPermission>[0], permission);
}

export function hasAnyPermission(
  roleName: string | null | undefined,
  permissions: readonly PermissionKey[],
): boolean {
  if (!roleName) return false;
  return permissions.some((p) => hasPermission(roleName, p));
}

export function hasAllPermissions(
  roleName: string | null | undefined,
  permissions: readonly PermissionKey[],
): boolean {
  if (!roleName) return false;
  return permissions.every((p) => hasPermission(roleName, p));
}

export function canAccessOrganization(
  userOrganizationIds: readonly string[],
  targetOrganizationId: string,
): boolean {
  if (!targetOrganizationId) return false;
  return userOrganizationIds.includes(targetOrganizationId);
}

export function getPaginationRange(input: PaginationInput): { from: number; to: number } {
  const from = (input.page - 1) * input.limit;
  return { from, to: from + input.limit - 1 };
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function omitUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(input) as Array<keyof T>) {
    if (input[key] !== undefined) {
      out[key] = input[key];
    }
  }
  return out;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
