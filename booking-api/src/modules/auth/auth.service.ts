import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma';
import { RegisterDto, LoginDto, RefreshDto } from './dtos';
import { JwtPayload } from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    const founded = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (founded) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
      },
    });

    const tokens = await this.getTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async refresh(payload: RefreshDto) {
    try {
      const { sub: userId } = await this.jwtService.verifyAsync<JwtPayload>(
        payload.refreshToken,
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.getTokens(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        ...tokens,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async getTokens(userId: string, email: string) {
    const jwtPayload: JwtPayload = { sub: userId, email };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: (process.env.ACCESS_TOKEN_TIME || '15m') as any,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: (process.env.REFRESH_TOKEN_TIME || '7d') as any,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
