import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResult extends TokenPair {
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    roles: string[];
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const slug = (dto.organizationSlug ?? this.slugify(dto.organizationName)).toLowerCase();
    const slugExists = await this.prisma.organization.findUnique({ where: { slug } });
    if (slugExists) throw new ConflictException('Organization slug already taken');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const ownerRole = await this.ensureOwnerRolePermissions();

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: dto.organizationName, slug },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
        },
      });

      const role = await tx.role.create({
        data: {
          organizationId: org.id,
          name: 'OWNER',
          description: 'Organization owner with full access',
          isSystem: true,
        },
      });

      await tx.userOrganizationRole.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          roleId: role.id,
        },
      });

      await tx.chatbotConfig.create({
        data: { organizationId: org.id },
      });

      // attach OWNER permissions
      for (const permKey of ownerRole) {
        const perm = await tx.permission.upsert({
          where: { key: permKey },
          update: {},
          create: { key: permKey, description: permKey },
        });
        await tx.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      }

      return { user, org };
    });

    return this.issueTokens(result.user.id, result.user.email, result.org.id, ['OWNER'], result.user.name);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        organizations: {
          include: { role: true, organization: true },
        },
      },
    });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    let membership = user.organizations[0];
    if (dto.organizationId) {
      membership =
        user.organizations.find((m) => m.organizationId === dto.organizationId) ?? membership;
    }
    if (!membership) throw new UnauthorizedException('No organization access');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const roles = user.organizations
      .filter((m) => m.organizationId === membership.organizationId)
      .map((m) => m.role.name);

    return this.issueTokens(user.id, user.email, membership.organizationId, roles, user.name);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hash(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true, organization: true },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // rotation: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const roles = await this.prisma.userOrganizationRole.findMany({
      where: { userId: stored.userId, organizationId: stored.organizationId ?? undefined },
      include: { role: true },
    });

    return this.issueTokens(
      stored.userId,
      stored.user.email,
      stored.organizationId ?? '',
      roles.map((r) => r.role.name),
      stored.user.name,
    );
  }

  async logout(userId: string, organizationId: string): Promise<{ success: boolean }> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, organizationId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async me(user: AuthenticatedUser): Promise<{
    id: string;
    email: string;
    name: string;
    organizationId: string;
    roles: string[];
  }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organizations: {
          where: { organizationId: user.organizationId },
          include: { role: true, organization: true },
        },
      },
    });
    if (!dbUser) throw new UnauthorizedException('User not found');
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      organizationId: user.organizationId,
      roles: dbUser.organizations.map((m) => m.role.name),
    };
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak existence
      this.logger.log(`Password reset requested for unknown email: ${email}`);
      return { success: true };
    }
    // Token generation stub. In production, send via email queue.
    const token = randomBytes(32).toString('hex');
    this.logger.log(`Password reset token for ${email}: ${token}`);
    return { success: true };
  }

  // --- helpers ---

  private async issueTokens(
    userId: string,
    email: string,
    organizationId: string,
    roles: string[],
    name: string,
  ): Promise<AuthResult> {
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const refreshTtlDays = Number(this.config.get<string>('JWT_REFRESH_TTL_DAYS', '30'));
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret');
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret');

    const payload: AuthenticatedUser = { id: userId, email, organizationId, roles };
    const accessToken = await this.jwt.signAsync(payload as any, {
      secret: accessSecret,
      expiresIn: accessTtl as any,
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = this.hash(refreshToken);
    const expiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, organizationId, tokenHash, expiresAt },
    });

    // keep refresh secret in cache for reference
    void refreshSecret;

    const expiresInSeconds = this.parseTtlSeconds(accessTtl);
    return {
      accessToken,
      refreshToken,
      expiresIn: expiresInSeconds,
      user: { id: userId, email, name, organizationId, roles },
    };
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'org';
  }

  private parseTtlSeconds(ttl: string): number {
    const m = /^(\d+)([smhd])$/.exec(ttl);
    if (!m) return 900;
    const n = Number(m[1]);
    switch (m[2]) {
      case 's': return n;
      case 'm': return n * 60;
      case 'h': return n * 3600;
      case 'd': return n * 86400;
      default: return 900;
    }
  }

  private async ensureOwnerRolePermissions(): Promise<string[]> {
    return [
      'org:read', 'org:update',
      'users:read', 'users:invite', 'users:update', 'users:remove',
      'customers:read', 'customers:create', 'customers:update', 'customers:delete',
      'conversations:read', 'conversations:create', 'conversations:update', 'conversations:close',
      'messages:read', 'messages:create',
      'kb:read', 'kb:write', 'kb:delete',
      'faq:read', 'faq:write', 'faq:delete',
      'tickets:read', 'tickets:create', 'tickets:update', 'tickets:assign', 'tickets:comment',
      'agents:read', 'agents:update',
      'whatsapp:read', 'whatsapp:send',
      'analytics:read',
      'billing:read', 'billing:manage',
      'notifications:read',
      'audit:read',
      'chatbot:read', 'chatbot:update',
      'files:read', 'files:write',
    ];
  }
}
