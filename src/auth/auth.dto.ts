import { IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @IsPhoneNumber('EG')
  phone!: string;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(3)
  address!: string;

  @IsString()
  @MinLength(2)
  location!: string;
}

export class LoginCustomerDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}
