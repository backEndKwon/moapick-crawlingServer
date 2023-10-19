import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";
import { ConfigService } from "@nestjs/config"; //추후 환경변수 사용
import { AuthService } from "../../auth/auth.service";
import { JwtPayload } from "../../auth/types/token.type";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //client로부터 전송된 토큰 추출
      secretOrKey: configService.get<string>("JWT_SECRETKEY"), //토큰 서명에 사용할 비밀키 지정
      ignoreExpiration: false, //토큰 만료여부 검사
    });
  }

  async validate(payload: JwtPayload, done: VerifiedCallback): Promise<any> {
    const user = await this.authService.validateTokenUser(payload); //user정보
    if (!user) {
      return done(
        new UnauthorizedException({
          message: "해당유저는 접근권한이 없습니다.",
        }),
        false,
      );
    }
    return done(null, user);
  }
}
