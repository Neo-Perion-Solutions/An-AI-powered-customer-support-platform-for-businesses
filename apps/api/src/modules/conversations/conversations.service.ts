import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationStatus, MessageRole, MessageChannel } from '@prisma/client';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ConversationsGateway,
  ) {}

  async list(
    organizationId: string,
    page?: number,
    pageSize?: number,
    filters?: { status?: ConversationStatus; customerId?: string; assignedAgentId?: string },
  ) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = {
      organizationId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
      ...(filters?.assignedAgentId ? { assignedAgentId: filters.assignedAgentId } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({
        where,
        skip,
        take,
        include: {
          customer: { select: { id: true, name: true, email: true, avatarUrl: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.conversation.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async get(organizationId: string, id: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        messages: { orderBy: { createdAt: 'asc' }, take: 100 },
        ticket: true,
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async create(organizationId: string, dto: CreateConversationDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, organizationId },
    });
    if (!customer) throw new NotFoundException('Customer not found in organization');

    const conversation = await this.prisma.conversation.create({
      data: {
        organizationId,
        customerId: dto.customerId,
        channel: dto.channel ?? MessageChannel.WEB,
        subject: dto.subject,
        status: dto.status ?? ConversationStatus.OPEN,
        metadata: {},
      },
    });

    if (dto.initialMessage) {
      await this.prisma.message.create({
        data: {
          organizationId,
          conversationId: conversation.id,
          role: MessageRole.CUSTOMER,
          channel: dto.channel ?? MessageChannel.WEB,
          content: dto.initialMessage,
        },
      });
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      });
    }

    this.gateway.emitConversationUpdate(organizationId, conversation.id, conversation);
    return this.get(organizationId, conversation.id);
  }

  async update(organizationId: string, id: string, dto: UpdateConversationDto) {
    const existing = await this.prisma.conversation.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('Conversation not found');

    const updated = await this.prisma.conversation.update({
      where: { id },
      data: {
        status: dto.status ?? undefined,
        assignedAgentId: dto.assignedAgentId === undefined ? undefined : dto.assignedAgentId,
        subject: dto.subject ?? undefined,
      },
    });
    this.gateway.emitConversationUpdate(organizationId, id, updated);
    return updated;
  }

  async close(organizationId: string, id: string) {
    const updated = await this.update(organizationId, id, { status: ConversationStatus.CLOSED });
    return updated;
  }

  async sendAgentMessage(organizationId: string, agentUserId: string, conversationId: string, dto: SendMessageDto) {
    const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, organizationId } });
    if (!conv) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.message.create({
      data: {
        organizationId,
        conversationId,
        role: MessageRole.AGENT,
        channel: conv.channel,
        content: dto.content,
        metadata: (dto.metadata ?? {}) as import('@prisma/client').Prisma.InputJsonValue,
      },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        status: conv.status === ConversationStatus.WAITING_AGENT ? ConversationStatus.WAITING_AGENT : ConversationStatus.OPEN,
        assignedAgentId: conv.assignedAgentId ?? agentUserId,
      },
    });
    this.gateway.emitNewMessage(organizationId, conversationId, message);
    return message;
  }

  async sendCustomerMessage(organizationId: string, conversationId: string, content: string) {
    const conv = await this.prisma.conversation.findFirst({ where: { id: conversationId, organizationId } });
    if (!conv) throw new NotFoundException('Conversation not found');

    const message = await this.prisma.message.create({
      data: {
        organizationId,
        conversationId,
        role: MessageRole.CUSTOMER,
        channel: conv.channel,
        content,
      },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    this.gateway.emitNewMessage(organizationId, conversationId, message);
    return message;
  }
}