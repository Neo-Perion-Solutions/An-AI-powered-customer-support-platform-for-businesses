import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg } from '../../common/guards/tenant.guard';
import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

class ScrapeUrlDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsUrl()
  url!: string;
}

class SearchKbDto {
  @ApiProperty()
  @IsString()
  query!: string;
}

@ApiTags('knowledge-base')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly service: KnowledgeBaseService) {}

  @Get()
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List knowledge sources' })
  list(
    @CurrentOrg() orgId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: string,
  ) {
    return this.service.list(orgId, page, pageSize, status as never);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get a knowledge source' })
  get(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Post()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Upload a document' })
  upload(@CurrentOrg() orgId: string, @Body() dto: CreateKnowledgeSourceDto) {
    return this.service.uploadDocument(orgId, dto);
  }

  @Post('scrape')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Scrape a URL and index its content' })
  scrape(@CurrentOrg() orgId: string, @Body() dto: ScrapeUrlDto) {
    return this.service.scrapeUrl(orgId, dto.name, dto.url);
  }

  @Get(':id/chunks')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'List chunks of a source' })
  chunks(
    @CurrentOrg() orgId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.getChunks(orgId, id, page, pageSize);
  }

  @Post(':id/reprocess')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Re-run ingestion' })
  reprocess(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.reprocess(orgId, id);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Delete a knowledge source' })
  remove(@CurrentOrg() orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }

  @Post('search')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'RAG semantic search' })
  search(@CurrentOrg() orgId: string, @Body() dto: SearchKbDto) {
    return this.service.search(orgId, dto.query);
  }
}