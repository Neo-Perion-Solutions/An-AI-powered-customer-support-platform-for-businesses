import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { KnowledgeSourceType } from '@prisma/client';

export class CreateKnowledgeSourceDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['PDF', 'DOCX', 'TXT', 'URL', 'FAQ'] })
  @IsIn(['PDF', 'DOCX', 'TXT', 'URL', 'FAQ'])
  type!: KnowledgeSourceType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  fileKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  fileSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  contentType?: string;
}