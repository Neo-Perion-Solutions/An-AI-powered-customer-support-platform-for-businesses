import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg } from '../../common/guards/tenant.guard';

@ApiTags('messages')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get('conversation/:conversationId')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List messages in a conversation' })
  list(
    @CurrentOrg() orgId: string,
    @Param('conversationId') conversationId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.list(orgId, conversationId, page, pageSize);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get a single message' })
  get(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }
}