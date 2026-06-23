import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, page?: number, pageSize?: number, category?: string, includeUnpublished = false) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = {
      organizationId,
      ...(category ? { category } : {}),
      ...(includeUnpublished ? {} : { isPublished: true }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.faq.findMany({ where, skip, take, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
      this.prisma.faq.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async get(organizationId: string, id: string) {
    const faq = await this.prisma.faq.findFirst({ where: { id, organizationId } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return faq;
  }

  async create(organizationId: string, dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: { ...dto, organizationId } });
  }

  async update(organizationId: string, id: string, dto: UpdateFaqDto) {
    const existing = await this.prisma.faq.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('FAQ not found');
    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async remove(organizationId: string, id: string) {
    const existing = await this.prisma.faq.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('FAQ not found');
    await this.prisma.faq.delete({ where: { id } });
    return { success: true };
  }
}