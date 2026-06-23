import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/billing.dto';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg, SkipTenant } from '../../common/guards/tenant.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly service: BillingService,
    private readonly config: ConfigService,
  ) {}

  @Get('plans')
  @Public()
  @SkipTenant()
  @ApiOperation({ summary: 'List available plans' })
  plans() {
    return this.service.getPlans();
  }

  @Get('subscription')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Get current subscription' })
  subscription(@CurrentOrg() orgId: string) {
    return this.service.getSubscription(orgId);
  }

  @Post('checkout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  checkout(@CurrentOrg() orgId: string, @Body() dto: CreateCheckoutDto) {
    return this.service.createCheckout(orgId, dto);
  }

  @Post('webhook')
  @Public()
  @SkipTenant()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook receiver' })
  async webhook(
    @Req() req: Request & { rawBody?: string },
    @Query('secret') secret?: string,
  ) {
    const expected = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (expected && secret !== expected) {
      // We allow signature-based verification in service as well
    }
    const raw = (req as unknown as { rawBody?: string }).rawBody ?? JSON.stringify(req.body ?? {});
    return this.service.handleWebhook(raw, req.headers['stripe-signature'] as string | undefined);
  }

  @Get('invoices')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'List invoices' })
  invoices(
    @CurrentOrg() orgId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.listInvoices(orgId, page, pageSize);
  }
}