import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipTenant } from '../common/guards/tenant.guard';
import { Public } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface HealthResponse {
  status: 'ok' | 'degraded';
  db: boolean;
  redis: boolean;
  uptime: number;
  timestamp: string;
  version: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();
  private readonly version = process.env['npm_package_version'] ?? '0.1.0';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @SkipTenant()
  @Get()
  @ApiOperation({ summary: 'Liveness + dependency health check' })
  async check(): Promise<HealthResponse> {
    const [db, redisOk] = await Promise.all([
      this.prisma.ping(),
      this.redis.ping(),
    ]);
    const status: 'ok' | 'degraded' = db && redisOk ? 'ok' : 'degraded';
    return {
      status,
      db,
      redis: redisOk,
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
      timestamp: new Date().toISOString(),
      version: this.version,
    };
  }
}
