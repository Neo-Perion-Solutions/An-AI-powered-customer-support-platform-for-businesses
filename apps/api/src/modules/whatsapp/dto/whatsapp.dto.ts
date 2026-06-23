import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWhatsappAccountDto {
  @ApiProperty()
  @IsString()
  phoneNumber!: string;

  @ApiProperty()
  @IsString()
  displayName!: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isMock?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

export class SendWhatsappMessageDto {
  @ApiProperty()
  @IsString()
  accountId!: string;

  @ApiProperty()
  @IsString()
  to!: string;

  @ApiProperty()
  @IsString()
  content!: string;
}