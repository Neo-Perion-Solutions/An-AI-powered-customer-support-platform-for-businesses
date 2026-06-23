import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateChatbotConfigDto } from './dto/chatbot.dto';

@Injectable()
export class ChatbotService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(organizationId: string) {
    const existing = await this.prisma.chatbotConfig.findUnique({ where: { organizationId } });
    if (existing) return existing;
    return this.prisma.chatbotConfig.create({
      data: { organizationId },
    });
  }

  async updateConfig(organizationId: string, dto: UpdateChatbotConfigDto) {
    return this.prisma.chatbotConfig.upsert({
      where: { organizationId },
      create: { ...dto, organizationId, settings: dto.settings as import('@prisma/client').Prisma.InputJsonValue | undefined },
      update: { ...dto, settings: dto.settings as import('@prisma/client').Prisma.InputJsonValue | undefined },
    });
  }
}