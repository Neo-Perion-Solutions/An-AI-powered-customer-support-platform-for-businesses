import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'owner@acme.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'P@ssw0rd!Strong' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Acme Inc.' })
  @IsString()
  @MinLength(2)
  organizationName!: string;

  @ApiProperty({ example: 'acme', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase letters, numbers, hyphens' })
  organizationSlug?: string;
}
