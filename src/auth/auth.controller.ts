import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginCustomerDto, RegisterCustomerDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('login-customer')
  loginCustomer(@Body() dto: LoginCustomerDto) {
    return this.authService.loginCustomer(dto);
  }

  @Post('login-admin')
  loginAdmin(@Body() dto: LoginCustomerDto) {
    return this.authService.loginAdmin(dto);
  }
}
