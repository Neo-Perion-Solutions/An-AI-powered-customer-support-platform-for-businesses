import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { ConversationStatus, TicketStatus, AgentStatus } from '@prisma/client';

const CACHE_TTL = 60; // 1 minute

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async overview(organizationId: string) {
    const cacheKey = `analytics:overview:${organizationId}`;
    const cached = await this.redis.get<Record<string, unknown>>(cacheKey);
    if (cached) return { ...cached, cached: true };

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      totalCustomers,
      totalConversations,
      openConversations,
      resolvedConversations,
      totalTickets,
      openTickets,
      totalAgents,
      onlineAgents,
      totalKnowledgeSources,
      totalMessages,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { organizationId } }),
      this.prisma.conversation.count({ where: { organizationId } }),
      this.prisma.conversation.count({ where: { organizationId, status: { in: [ConversationStatus.OPEN, ConversationStatus.AI_HANDLING, ConversationStatus.WAITING_AGENT, ConversationStatus.ESCALATED] } } }),
      this.prisma.conversation.count({ where: { organizationId, status: ConversationStatus.RESOLVED } }),
      this.prisma.ticket.count({ where: { organizationId } }),
      this.prisma.ticket.count({ where: { organizationId, status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_AGENT, TicketStatus.WAITING_CUSTOMER] } } }),
      this.prisma.agent.count({ where: { organizationId } }),
      this.prisma.agent.count({ where: { organizationId, status: AgentStatus.ONLINE } }),
      this.prisma.knowledgeSource.count({ where: { organizationId, status: 'READY' } }),
      this.prisma.message.count({ where: { organizationId, createdAt: { gte: since } } }),
    ]);

    const result = {
      totalCustomers,
      totalConversations,
      openConversations,
      resolvedConversations,
      resolutionRate: totalConversations > 0 ? resolvedConversations / totalConversations : 0,
      totalTickets,
      openTickets,
      totalAgents,
      onlineAgents,
      totalKnowledgeSources,
      messagesLast30Days: totalMessages,
    };
    await this.redis.set(cacheKey, result, CACHE_TTL);
    return { ...result, cached: false };
  }

  async conversations(organizationId: string, days = 30) {
    const cacheKey = `analytics:conversations:${organizationId}:${days}`;
    const cached = await this.redis.get<unknown[]>(cacheKey);
    if (cached) return cached;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await this.prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', "createdAt") as day, COUNT(*)::bigint as count
      FROM "Conversation"
      WHERE "organizationId" = ${organizationId}::uuid AND "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `;

    const result = data.map((r) => ({ day: r.day, count: Number(r.count) }));
    await this.redis.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async agents(organizationId: string) {
    const cacheKey = `analytics:agents:${organizationId}`;
    const cached = await this.redis.get<unknown[]>(cacheKey);
    if (cached) return cached;

    const agents = await this.prisma.agent.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: {} },
      },
    });

    const stats = await Promise.all(
      agents.map(async (a) => {
        const [openTickets, resolvedTickets] = await Promise.all([
          this.prisma.ticket.count({ where: { organizationId, assigneeId: a.userId, status: { not: TicketStatus.CLOSED } } }),
          this.prisma.ticket.count({ where: { organizationId, assigneeId: a.userId, status: TicketStatus.RESOLVED } }),
        ]);
        return {
          agentId: a.id,
          userId: a.userId,
          name: a.user.name,
          status: a.status,
          openTickets,
          resolvedTickets,
          skills: a.skills,
        };
      }),
    );
    await this.redis.set(cacheKey, stats, CACHE_TTL);
    return stats;
  }

  async roi(organizationId: string) {
    const cacheKey = `analytics:roi:${organizationId}`;
    const cached = await this.redis.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [aiMessages, humanMessages, resolved] = await Promise.all([
      this.prisma.message.count({ where: { organizationId, role: 'AI', createdAt: { gte: since } } }),
      this.prisma.message.count({ where: { organizationId, role: 'AGENT', createdAt: { gte: since } } }),
      this.prisma.conversation.count({ where: { organizationId, status: ConversationStatus.RESOLVED, updatedAt: { gte: since } } }),
    ]);

    // Assumed minutes saved per AI response (industry avg ~3-5)
    const minutesPerAIResponse = 4;
    const minutesSaved = aiMessages * minutesPerAIResponse;
    const hoursSaved = minutesSaved / 60;
    const costPerAgentHour = 25;
    const estimatedSavings = hoursSaved * costPerAgentHour;

    const result = {
      window: '30d',
      aiMessages,
      humanMessages,
      automationRate: aiMessages + humanMessages > 0 ? aiMessages / (aiMessages + humanMessages) : 0,
      conversationsResolved: resolved,
      minutesSaved,
      hoursSaved,
      estimatedSavingsUSD: Number(estimatedSavings.toFixed(2)),
    };
    await this.redis.set(cacheKey, result, CACHE_TTL);
    return result;
  }
}