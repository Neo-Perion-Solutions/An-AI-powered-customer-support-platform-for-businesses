import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg, SkipTenant } from '../../common/guards/tenant.guard';

@ApiTags('faq')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('faq')
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List FAQs' })
  list(
    @CurrentOrg() orgId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('category') category?: string,
    @Query('includeUnpublished') includeUnpublished?: string,
  ) {
    return this.service.list(orgId, page, pageSize, category, includeUnpublished === 'true');
  }

  @Get('public')
  @Public()
  @SkipTenant()
  @ApiOperation({ summary: 'Public FAQ listing (per org via X-Organization-Id header is enforced by guard when present)' })
  // We resolve org from query param when called publicly (chatbot flow)
  listPublic() {
    return { items: [], note: 'Use GET /faq with auth for full list' };
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get a FAQ' })
  get(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Post()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Create a FAQ' })
  create(@CurrentOrg() orgId: string, @Body() dto: CreateFaqDto) {
    return this.service.create(orgId, dto);
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update a FAQ' })
  update(@CurrentOrg() orgId: string, @Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Delete a FAQ' })
  remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}