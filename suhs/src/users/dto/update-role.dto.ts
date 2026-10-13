import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateRoleDto {
  @IsEnum(Role, {
    message: 'role must be one of ADMIN, TEACHER, or STUDENT',
  })
  role: Role;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  className?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  rollNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  division?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentGroup?: string;
}
