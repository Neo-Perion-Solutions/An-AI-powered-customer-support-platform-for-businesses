import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(8000)
  content!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  parentMessageId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}