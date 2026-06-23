import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { UpdateChatbotConfigDto } from './dto/chatbot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg } from '../../common/guards/tenant.guard';

@ApiTags('chatbot')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly service: ChatbotService) {}

  @Get('config')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get chatbot configuration' })
  get(@CurrentOrg() orgId: string) {
    return this.service.getConfig(orgId);
  }

  @Patch('config')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update chatbot configuration' })
  update(@CurrentOrg() orgId: string, @Body() dto: UpdateChatbotConfigDto) {
    return this.service.updateConfig(orgId, dto);
  }
}