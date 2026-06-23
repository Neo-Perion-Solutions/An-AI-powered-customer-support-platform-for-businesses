import {
  Body,
  Controller,
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
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg, CurrentUser } from '../../common/guards/tenant.guard';
import type { AuthenticatedUser } from '../../common/guards/jwt-auth.guard';
import { ConversationStatus } from '@prisma/client';

@ApiTags('conversations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly service: ConversationsService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List conversations' })
  list(
    @CurrentOrg() orgId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: ConversationStatus,
    @Query('customerId') customerId?: string,
    @Query('assignedAgentId') assignedAgentId?: string,
  ) {
    return this.service.list(orgId, page, pageSize, { status, customerId, assignedAgentId });
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get a conversation with messages' })
  get(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Post()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Create a conversation' })
  create(@CurrentOrg() orgId: string, @Body() dto: CreateConversationDto) {
    return this.service.create(orgId, dto);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Update a conversation' })
  update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() dto: UpdateConversationDto) {
    return this.service.update(orgId, id, dto);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Close a conversation' })
  close(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.close(orgId, id);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Send a message as an agent' })
  sendMessage(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.service.sendAgentMessage(orgId, user.id, id, dto);
  }
}