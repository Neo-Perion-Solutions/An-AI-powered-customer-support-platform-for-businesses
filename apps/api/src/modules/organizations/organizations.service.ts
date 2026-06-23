import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            conversations: true,
            tickets: true,
            knowledgeSources: true,
          },
        },
        subscription: true,
      },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(organizationId: string, dto: UpdateOrganizationDto) {
    const org = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: dto.name ?? undefined,
        settings: dto.settings ?? undefined,
      },
    });
    return org;
  }
}
