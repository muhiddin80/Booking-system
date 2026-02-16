import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule, EventsModule, BookingsModule } from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: Number(process.env.ACCESS_TOKEN_TIME) || '900s',
      },
    }),
    PrismaModule,
    AuthModule,
    EventsModule,
    BookingsModule,
  ],
})
export class AppModule {}
