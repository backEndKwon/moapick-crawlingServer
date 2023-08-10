import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//AuthGuard는 nestjs에서 미들웨어로 작동하며, 요청을 처리하기전 실행 됨
//LocalServiceAuthGuard는 passport의 authguard를 확작하여, local-srvice전략을 사용하여 로그인 인증 수행
//인증 성공시 = api 요청, 실패시 = 401 에러(unauthorizaedException)

@Injectable()
export class LocalServiceAuthGuard extends AuthGuard('local-service') {}
