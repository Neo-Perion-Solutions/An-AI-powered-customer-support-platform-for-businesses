import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'warn'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'query' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    this.$on('error', (event) => {
      this.logger.error(`Prisma error: ${event.message}`);
    });
    this.$on('warn', (event) => {
      this.logger.warn(`Prisma warning: ${event.message}`);
    });
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }

  async ping(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  tenantFilter<T extends { organizationId: string }>(orgId: string): T {
    return { organizationId: orgId } as T;
  }
}