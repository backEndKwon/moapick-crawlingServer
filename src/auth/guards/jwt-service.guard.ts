import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//API호출시 토큰이 있는 상태에서만 API 호출이 가능하도록 코드 추가
//controller에 @UseGuards(JwtServiceAuthGuard) 추가해서 해당 기능은 accessToken이 있는 상태에서만 호출 가능하도록 설정
@Injectable()
export class JwtServiceAuthGuard extends AuthGuard('jwt-service') {}