import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanTier } from '@prisma/client';

export class CreateCheckoutDto {
  @ApiProperty({ enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] })
  @IsIn(['FREE', 'STARTER', 'PRO', 'ENTERPRISE'])
  plan!: PlanTier;

  @ApiProperty({ required: false })
  @IsString()
  successUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  cancelUrl?: string;
}