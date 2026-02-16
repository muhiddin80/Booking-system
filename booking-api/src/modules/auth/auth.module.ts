import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma';
import { AtStrategy } from './strategy';
import { AtGuard } from './guards';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AtStrategy, AtGuard],
  exports: [AuthService],
})
export class AuthModule {}
