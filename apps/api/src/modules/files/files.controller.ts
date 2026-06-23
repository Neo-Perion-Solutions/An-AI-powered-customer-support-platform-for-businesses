import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard, CurrentOrg } from '../../common/guards/tenant.guard';

@ApiTags('files')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('upload')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a file to storage' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  upload(@CurrentOrg() orgId: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.upload(orgId, file);
  }

  @Get('*key')
  @Roles('OWNER', 'ADMIN', 'AGENT')
  @ApiOperation({ summary: 'Get a signed download URL (302 redirect)' })
  async get(
    @CurrentOrg() _orgId: string,
    @Param('key') key: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.service.getDownloadUrl(key);
    res.redirect(url);
  }

  @Delete('*key')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Delete a file' })
  remove(@CurrentOrg() orgId: string, @Param('key') key: string) {
    return this.service.remove(orgId, key);
  }
}