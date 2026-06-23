import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginationParams, paginatedResponse } from '../../common/utils/tenant.util';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, page?: number, pageSize?: number, search?: string) {
    const { skip, take, page: p, pageSize: ps } = paginationParams(page, pageSize);
    const where = {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ]);
    return paginatedResponse(items, total, p, ps);
  }

  async get(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        conversations: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(organizationId: string, dto: CreateCustomerDto) {
    if (dto.externalId) {
      const exists = await this.prisma.customer.findUnique({
        where: { organizationId_externalId: { organizationId, externalId: dto.externalId } },
      });
      if (exists) throw new ConflictException('Customer with externalId already exists');
    }
    return this.prisma.customer.create({
      data: { ...dto, organizationId, metadata: dto.metadata as import('@prisma/client').Prisma.InputJsonValue | undefined },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('Customer not found');
    return this.prisma.customer.update({ where: { id }, data: { ...dto, metadata: dto.metadata as import('@prisma/client').Prisma.InputJsonValue | undefined } });
  }

  async remove(organizationId: string, id: string) {
    const existing = await this.prisma.customer.findFirst({ where: { id, organizationId } });
    if (!existing) throw new NotFoundException('Customer not found');
    await this.prisma.customer.delete({ where: { id } });
    return { success: true };
  }
}
