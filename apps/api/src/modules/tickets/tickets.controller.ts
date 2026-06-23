import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddCommentDto, AssignTicketDto, UpdateTicketDto, UpdateTicketStatusDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg, CurrentUser } from '../../common/guards/tenant.guard';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { TicketPriority, TicketStatus } from '@prisma/client';

@ApiTags('tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List tickets' })
  list(
    @CurrentOrg() orgId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: TicketStatus,
    @Query('assigneeId') assigneeId?: string,
    @Query('priority') priority?: TicketPriority,
    @Query('search') search?: string,
  ) {
    return this.service.list(orgId, page, pageSize, { status, assigneeId, priority, search });
  }

  @Get('kanban')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get tickets grouped by status for kanban view' })
  kanban(@CurrentOrg() orgId: string) {
    return this.service.kanban(orgId);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get a ticket with comments' })
  get(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Post()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Create a ticket' })
  create(@CurrentOrg() orgId: string, @Body() dto: CreateTicketDto) {
    return this.service.create(orgId, dto);
  }

  @Patch(':id/status')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Transition ticket status (kanban)' })
  updateStatus(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.service.updateStatus(orgId, id, dto);
  }

  @Patch(':id/assign')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Assign or unassign a ticket' })
  assign(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.service.assign(orgId, id, dto);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Update ticket details' })
  update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.service.update(orgId, id, dto);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Add a comment to a ticket' })
  addComment(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
  ) {
    return this.service.addComment(orgId, id, user.id, dto);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Delete a ticket' })
  remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}