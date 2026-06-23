import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { UpdateAgentDto, UpdateAgentStatusDto } from './dto/agent.dto';
import { AgentStatus } from '@prisma/client';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    page?: number,
    pageSize?: number,
    filters?: { status?: AgentStatus; skill?: string },
  ) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = {
      organizationId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.skill ? { skills: { has: filters.skill } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.agent.findMany({
        where,
        skip,
        take,
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async get(organizationId: string, id: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async getByUser(organizationId: string, userId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { userId, organizationId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    if (!agent) throw new NotFoundException('Agent profile not found');
    return agent;
  }

  async updateStatus(organizationId: string, userId: string, dto: UpdateAgentStatusDto) {
    const agent = await this.prisma.agent.findFirst({ where: { userId, organizationId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const updated = await this.prisma.agent.update({
      where: { id: agent.id },
      data: { status: dto.status },
    });
    await this.prisma.agentStatusHistory.create({
      data: {
        organizationId,
        agentId: agent.id,
        status: dto.status,
        reason: dto.reason,
      },
    });
    return updated;
  }

  async update(organizationId: string, userId: string, dto: UpdateAgentDto) {
    const agent = await this.prisma.agent.findFirst({ where: { userId, organizationId } });
    if (!agent) throw new NotFoundException('Agent not found');
    return this.prisma.agent.update({
      where: { id: agent.id },
      data: {
        skills: dto.skills ?? undefined,
        maxConcurrent: dto.maxConcurrent ?? undefined,
      },
    });
  }
}