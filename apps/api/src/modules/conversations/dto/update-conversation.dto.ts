import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConversationStatus } from '@prisma/client';

export class UpdateConversationDto {
  @ApiProperty({ required: false, enum: ['OPEN', 'AI_HANDLING', 'ESCALATED', 'WAITING_AGENT', 'RESOLVED', 'CLOSED'] })
  @IsOptional()
  @IsIn(['OPEN', 'AI_HANDLING', 'ESCALATED', 'WAITING_AGENT', 'RESOLVED', 'CLOSED'])
  status?: ConversationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedAgentId?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;
}