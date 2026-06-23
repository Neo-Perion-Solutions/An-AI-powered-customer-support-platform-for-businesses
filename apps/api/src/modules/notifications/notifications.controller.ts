import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg, CurrentUser } from '../../common/guards/tenant.guard';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List my notifications' })
  list(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.service.list(orgId, user.id, page, pageSize, unreadOnly === 'true');
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.service.markRead(orgId, user.id, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Mark all as read' })
  markAllRead(@CurrentOrg() orgId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.markAllRead(orgId, user.id);
  }
}