import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ required: false, enum: ['AGENT', 'ADMIN', 'OWNER', 'VIEWER'] })
  @IsOptional()
  @IsString()
  @IsIn(['AGENT', 'ADMIN', 'OWNER', 'VIEWER'])
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean;
}
