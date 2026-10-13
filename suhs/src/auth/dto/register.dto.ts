import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MaxLength(30)
  className: string;

  @IsString()
  @MaxLength(30)
  rollNumber: string;

  @IsString()
  @MaxLength(50)
  division: string;

  @IsString()
  @MaxLength(50)
  studentGroup: string;
}
