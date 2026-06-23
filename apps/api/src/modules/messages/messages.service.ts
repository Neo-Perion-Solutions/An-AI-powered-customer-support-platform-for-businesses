import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    conversationId: string,
    page?: number,
    pageSize?: number,
  ) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
      select: { id: true },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = { organizationId, conversationId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        skip,
        take,
        include: { attachments: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.message.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async get(organizationId: string, id: string) {
    const message = await this.prisma.message.findFirst({
      where: { id, organizationId },
      include: { attachments: true },
    });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }
}