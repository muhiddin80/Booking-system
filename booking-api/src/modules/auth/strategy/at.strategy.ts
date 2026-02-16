import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 1. Import ConfigService
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/types/jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET')!,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
