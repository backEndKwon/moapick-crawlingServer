import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';//추후 환경변수 사용

@Injectable()
export class JwtServiceStrategy extends PassportStrategy(
  Strategy,
  'jwt-service',
) {
  constructor(
    private readonly configService: ConfigService
    ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRETOTKEY') , //토큰 서명에 사용할 비밀키 지정
      ignoreExpiration: configService.get<string>('IGNORE_EXPIRATION'), //토큰 만료여부 검사
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //클라으언트로부터 전송된 토큰 추출
    });
  }
  async validate(payload: any) {
    return { email: payload.email };
  }
}
