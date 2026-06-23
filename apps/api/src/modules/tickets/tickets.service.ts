import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddCommentDto, AssignTicketDto, UpdateTicketDto, UpdateTicketStatusDto } from './dto/update-ticket.dto';
import { TicketStatus, TicketPriority, NotificationType } from '@prisma/client';

const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_CUSTOMER, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.WAITING_CUSTOMER, TicketStatus.WAITING_AGENT, TicketStatus.RESOLVED, TicketStatus.CLOSED],
  [TicketStatus.WAITING_CUSTOMER]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED],
  [TicketStatus.WAITING_AGENT]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
  [TicketStatus.CLOSED]: [],
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    page?: number,
    pageSize?: number,
    filters?: { status?: TicketStatus; assigneeId?: string; priority?: TicketPriority; search?: string },
  ) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = {
      organizationId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
      ...(filters?.priority ? { priority: filters.priority } : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' as const } },
              { description: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        include: { assignee: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async kanban(organizationId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { organizationId, status: { not: TicketStatus.CLOSED } },
      include: { assignee: { select: { id: true, name: true, email: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
    const grouped: Record<string, typeof tickets> = {
      OPEN: [],
      IN_PROGRESS: [],
      WAITING_CUSTOMER: [],
      WAITING_AGENT: [],
      RESOLVED: [],
    };
    for (const t of tickets) grouped[t.status].push(t);
    return grouped;
  }

  async get(organizationId: string, id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, organizationId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        conversation: true,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async create(organizationId: string, dto: CreateTicketDto) {
    const last = await this.prisma.ticket.findFirst({
      where: { organizationId },
      orderBy: { number: 'desc' },
    });
    const number = (last?.number ?? 1000) + 1;

    const ticket = await this.prisma.ticket.create({
      data: {
        organizationId,
        number,
        title: dto.title,
        description: dto.description,
        conversationId: dto.conversationId,
        assigneeId: dto.assigneeId,
        priority: dto.priority ?? TicketPriority.MEDIUM,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        tags: dto.tags ?? [],
      },
    });

    if (dto.assigneeId) {
      await this.prisma.notification.create({
        data: {
          organizationId,
          userId: dto.assigneeId,
          type: NotificationType.TICKET_ASSIGNED,
          title: `Ticket #${number} assigned to you`,
          body: dto.title,
          data: { ticketId: ticket.id },
        },
      });
    }

    return ticket;
  }

  async updateStatus(organizationId: string, id: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, organizationId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    const allowed = STATUS_TRANSITIONS[ticket.status] ?? [];
    if (ticket.status !== dto.status && !allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${ticket.status} to ${dto.status}`);
    }
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedAt: dto.status === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt,
      },
    });
  }

  async assign(organizationId: string, id: string, dto: AssignTicketDto) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, organizationId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { assigneeId: dto.assigneeId ?? null },
    });

    if (dto.assigneeId) {
      await this.prisma.notification.create({
        data: {
          organizationId,
          userId: dto.assigneeId,
          type: NotificationType.TICKET_ASSIGNED,
          title: `Ticket #${ticket.number} assigned to you`,
          body: ticket.title,
          data: { ticketId: ticket.id },
        },
      });
    }
    return updated;
  }

  async update(organizationId: string, id: string, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, organizationId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.ticket.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        priority: dto.priority ?? undefined,
        tags: dto.tags ?? undefined,
      },
    });
  }

  async addComment(organizationId: string, ticketId: string, authorId: string, dto: AddCommentDto) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id: ticketId, organizationId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.ticketComment.create({
      data: {
        organizationId,
        ticketId,
        authorId,
        content: dto.content,
        isInternal: dto.isInternal ?? false,
      },
      include: { author: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }

  async remove(organizationId: string, id: string) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, organizationId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    await this.prisma.ticket.delete({ where: { id } });
    return { success: true };
  }
}