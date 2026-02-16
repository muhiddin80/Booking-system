import { PickType } from '@nestjs/swagger';
import { RegisterDto } from './register.dtos';

export class LoginDto extends PickType(RegisterDto, [
  'email',
  'password',
] as const) {}
