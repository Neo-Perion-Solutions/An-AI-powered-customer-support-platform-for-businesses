import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SendWhatsappMessageDto, CreateWhatsappAccountDto } from './dto/whatsapp.dto';
import { MessageChannel, MessageRole } from '@prisma/client';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listAccounts(organizationId: string) {
    return this.prisma.whatsappAccount.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAccount(organizationId: string, dto: CreateWhatsappAccountDto) {
    return this.prisma.whatsappAccount.create({
      data: {
        organizationId,
        phoneNumber: dto.phoneNumber,
        displayName: dto.displayName,
        isMock: dto.isMock ?? true,
        webhookUrl: dto.webhookUrl,
      },
    });
  }

  async sendMessage(organizationId: string, dto: SendWhatsappMessageDto) {
    const account = await this.prisma.whatsappAccount.findFirst({
      where: { id: dto.accountId, organizationId },
    });
    if (!account) throw new NotFoundException('WhatsApp account not found');

    // Mock provider
    const externalId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const msg = await this.prisma.whatsappMessage.create({
      data: {
        organizationId,
        accountId: account.id,
        externalId,
        fromNumber: account.phoneNumber,
        toNumber: dto.to,
        direction: 'outbound',
        content: dto.content,
        status: 'sent',
      },
    });
    this.logger.log(`[MOCK] Sent WA message ${externalId} to ${dto.to}`);
    return msg;
  }

  verifyWebhookSignature(rawBody: string, signature: string | undefined, secret: string | undefined): boolean {
    if (!secret) {
      // dev mode: allow when no secret configured
      return true;
    }
    if (!signature) return false;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  async handleWebhook(
    organizationId: string,
    accountId: string,
    payload: {
      externalId: string;
      from: string;
      to: string;
      content: string;
      timestamp?: string;
    },
  ) {
    const account = await this.prisma.whatsappAccount.findFirst({
      where: { id: accountId, organizationId },
    });
    if (!account) throw new NotFoundException('Account not found');

    // Find or create customer by phone
    let customer = await this.prisma.customer.findFirst({
      where: { organizationId, phone: payload.from },
    });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          organizationId,
          phone: payload.from,
          name: `WA ${payload.from}`,
        },
      });
    }

    // Find or create conversation for customer on this channel
    let conversation = await this.prisma.conversation.findFirst({
      where: { organizationId, customerId: customer.id, channel: MessageChannel.WHATSAPP, status: { not: 'CLOSED' } },
      orderBy: { createdAt: 'desc' },
    });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          organizationId,
          customerId: customer.id,
          channel: MessageChannel.WHATSAPP,
          status: 'OPEN',
        },
      });
    }

    const message = await this.prisma.message.create({
      data: {
        organizationId,
        conversationId: conversation.id,
        role: MessageRole.CUSTOMER,
        channel: MessageChannel.WHATSAPP,
        content: payload.content,
        metadata: { externalId: payload.externalId, from: payload.from, receivedAt: payload.timestamp },
      },
    });

    await this.prisma.whatsappMessage.create({
      data: {
        organizationId,
        accountId,
        externalId: payload.externalId,
        fromNumber: payload.from,
        toNumber: payload.to,
        direction: 'inbound',
        content: payload.content,
        status: 'received',
        metadata: { conversationId: conversation.id, messageId: message.id },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return { conversation, message };
  }
}