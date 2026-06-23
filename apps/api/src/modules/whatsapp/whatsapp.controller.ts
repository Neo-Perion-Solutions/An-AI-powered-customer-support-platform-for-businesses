import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { WhatsappService } from './whatsapp.service';
import { CreateWhatsappAccountDto, SendWhatsappMessageDto } from './dto/whatsapp.dto';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg, SkipTenant } from '../../common/guards/tenant.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly service: WhatsappService,
    private readonly config: ConfigService,
  ) {}

  @Get('accounts')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List WhatsApp accounts' })
  listAccounts(@CurrentOrg() orgId: string) {
    return this.service.listAccounts(orgId);
  }

  @Post('accounts')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Create a WhatsApp account' })
  createAccount(@CurrentOrg() orgId: string, @Body() dto: CreateWhatsappAccountDto) {
    return this.service.createAccount(orgId, dto);
  }

  @Post('send')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  send(@CurrentOrg() orgId: string, @Body() dto: SendWhatsappMessageDto) {
    return this.service.sendMessage(orgId, dto);
  }

  @Public()
  @SkipTenant()
  @Post('webhook/:organizationId/:accountId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive a WhatsApp webhook (HMAC verified)' })
  async webhook(
    @Param('organizationId') organizationId: string,
    @Param('accountId') accountId: string,
    @Headers('x-wa-signature') signature: string | undefined,
    @Req() req: Request & { rawBody?: string },
  ) {
    const secret = this.config.get<string>('WHATSAPP_WEBHOOK_SECRET');
    const raw = (req as unknown as { rawBody?: string }).rawBody ?? '';
    if (!this.service.verifyWebhookSignature(raw, signature, secret)) {
      throw new ForbiddenException('Invalid signature');
    }
    if (!raw) throw new BadRequestException('Empty body');
    let payload: { externalId: string; from: string; to: string; content: string; timestamp?: string };
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new BadRequestException('Invalid JSON');
    }
    return this.service.handleWebhook(organizationId, accountId, payload);
  }
}