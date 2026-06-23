import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority, TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_AGENT', 'RESOLVED', 'CLOSED'] })
  @IsIn(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_AGENT', 'RESOLVED', 'CLOSED'])
  status!: TicketStatus;
}

export class AssignTicketDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}

export class UpdateTicketDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: TicketPriority;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  tags?: string[];
}

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  isInternal?: boolean;
}