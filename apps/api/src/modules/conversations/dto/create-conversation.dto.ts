import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageChannel, ConversationStatus } from '@prisma/client';

export class CreateConversationDto {
  @ApiProperty()
  @IsUUID()
  customerId!: string;

  @ApiProperty({ enum: ['WEB', 'WHATSAPP', 'EMAIL', 'API'], required: false, default: 'WEB' })
  @IsOptional()
  @IsIn(['WEB', 'WHATSAPP', 'EMAIL', 'API'])
  channel?: MessageChannel;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  initialMessage?: string;

  @ApiProperty({ required: false, enum: ['OPEN', 'AI_HANDLING', 'ESCALATED', 'WAITING_AGENT', 'RESOLVED', 'CLOSED'] })
  @IsOptional()
  @IsIn(['OPEN', 'AI_HANDLING', 'ESCALATED', 'WAITING_AGENT', 'RESOLVED', 'CLOSED'])
  status?: ConversationStatus;
}