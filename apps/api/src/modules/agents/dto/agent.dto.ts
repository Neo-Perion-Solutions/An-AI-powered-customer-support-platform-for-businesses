import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentStatus } from '@prisma/client';

export class UpdateAgentStatusDto {
  @ApiProperty({ enum: ['ONLINE', 'AWAY', 'BUSY', 'OFFLINE'] })
  @IsIn(['ONLINE', 'AWAY', 'BUSY', 'OFFLINE'])
  status!: AgentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAgentDto {
  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxConcurrent?: number;
}