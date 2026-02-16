import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return await this.service.register(payload);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() payload: LoginDto) {
    return await this.service.login(payload);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() payload: RefreshDto) {
    return await this.service.refresh(payload);
  }
}
