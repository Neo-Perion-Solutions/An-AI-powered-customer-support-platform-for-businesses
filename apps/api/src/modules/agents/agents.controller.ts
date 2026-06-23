import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { UpdateAgentDto, UpdateAgentStatusDto } from './dto/agent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg, CurrentUser } from '../../common/guards/tenant.guard';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { AgentStatus } from '@prisma/client';

@ApiTags('agents')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('agents')
export class AgentsController {
  constructor(private readonly service: AgentsService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List agents' })
  list(
    @CurrentOrg() orgId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: AgentStatus,
    @Query('skill') skill?: string,
  ) {
    return this.service.list(orgId, page, pageSize, { status, skill });
  }

  @Get('me')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get my agent profile' })
  me(@CurrentOrg() orgId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.getByUser(orgId, user.id);
  }

  @Patch('me/status')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Update my status' })
  updateMyStatus(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAgentStatusDto,
  ) {
    return this.service.updateStatus(orgId, user.id, dto);
  }

  @Patch('me')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Update my agent profile' })
  updateMe(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.service.update(orgId, user.id, dto);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get an agent' })
  get(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }
}