import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, userId: string, page?: number, pageSize?: number, unreadOnly = false) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = {
      organizationId,
      userId,
      ...(unreadOnly ? { readAt: null } : {}),
    };
    const [items, total, unread] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { organizationId, userId, readAt: null } }),
    ]);
    return { ...paginatedResponse(items, total, p, ps), unread };
  }

  async markRead(organizationId: string, userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({ where: { id, organizationId, userId } });
    if (!notif) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: notif.readAt ?? new Date() },
    });
  }

  async markAllRead(organizationId: string, userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { organizationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: res.count };
  }
}