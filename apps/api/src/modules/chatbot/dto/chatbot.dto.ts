import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChatbotConfigDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fallbackMessage?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  escalationKeywords?: string[];

  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceThreshold?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  handoffEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  settings?: Record<string, unknown>;
}