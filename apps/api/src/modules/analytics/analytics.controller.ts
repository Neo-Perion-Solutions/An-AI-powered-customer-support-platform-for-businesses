import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg } from '../../common/guards/tenant.guard';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Aggregate KPIs' })
  overview(@CurrentOrg() orgId: string) {
    return this.service.overview(orgId);
  }

  @Get('conversations')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Daily conversation counts' })
  conversations(@CurrentOrg() orgId: string, @Query('days') days?: number) {
    return this.service.conversations(orgId, days ?? 30);
  }

  @Get('agents')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Per-agent performance' })
  agents(@CurrentOrg() orgId: string) {
    return this.service.agents(orgId);
  }

  @Get('roi')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'AI automation ROI' })
  roi(@CurrentOrg() orgId: string) {
    return this.service.roi(orgId);
  }
}