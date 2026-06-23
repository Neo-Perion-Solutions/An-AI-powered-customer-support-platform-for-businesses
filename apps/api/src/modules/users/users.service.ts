import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, page?: number, pageSize?: number, search?: string) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = {
      organizations: { some: { organizationId } },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          organizations: {
            where: { organizationId },
            include: { role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async get(organizationId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizations: { some: { organizationId } } },
      include: {
        organizations: { where: { organizationId }, include: { role: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async invite(organizationId: string, dto: InviteUserDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      const tempPassword = randomBytes(16).toString('hex');
      const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id });
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
        },
      });
      this.logger.log(`Created user ${dto.email} with temporary password`);
    }

    const existing = await this.prisma.userOrganizationRole.findUnique({
      where: { userId_organizationId: { userId: user.id, organizationId } },
    });
    if (existing) throw new ConflictException('User already in organization');

    const role = await this.prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: dto.role } },
      update: {},
      create: { organizationId, name: dto.role, isSystem: true },
    });

    await this.prisma.userOrganizationRole.create({
      data: { userId: user.id, organizationId, roleId: role.id },
    });

    return this.get(organizationId, user.id);
  }

  async update(organizationId: string, userId: string, dto: UpdateUserDto) {
    const existing = await this.prisma.userOrganizationRole.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!existing) throw new NotFoundException('User not in organization');

    if (dto.role && dto.role !== undefined) {
      const role = await this.prisma.role.upsert({
        where: { organizationId_name: { organizationId, name: dto.role } },
        update: {},
        create: { organizationId, name: dto.role, isSystem: true },
      });
      await this.prisma.userOrganizationRole.update({
        where: { id: existing.id },
        data: { roleId: role.id },
      });
    }

    if (dto.name || dto.isActive !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: dto.name ?? undefined,
          isActive: dto.isActive ?? undefined,
        },
      });
    }

    return this.get(organizationId, userId);
  }

  async remove(organizationId: string, userId: string) {
    const existing = await this.prisma.userOrganizationRole.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!existing) throw new NotFoundException('User not in organization');
    await this.prisma.userOrganizationRole.delete({ where: { id: existing.id } });
    return { success: true };
  }
}
