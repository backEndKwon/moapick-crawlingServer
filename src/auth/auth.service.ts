import {
  UnauthorizedException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from 'src/dtos/user.dto';
import { validatePassword } from './validations/local-service.validate';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  // (1) [일반] 로그인
  async commonLogin(user: LoginDto) {
    try {
      const email = user.email;
      const loginUserPassword = user.password;
      const userInfo = await this.findUser(email);
      const existUserPassword = userInfo.password;
      const isValidPassword = await validatePassword(
        existUserPassword,
        loginUserPassword,
      );
      if (!isValidPassword)
        throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
      const accessToken = await this.loginServiceUser(email);
      return { accessToken, userInfo };
    } catch (err) {
      throw new err('로그인에 실패하였습니다.');
    }
  }

  // (2) [구글] 로그인
  async googleLogin(email: string, name: string) {
    try {
      const existUser = await this.userRepository.findOne({ where: { email } });
      if (!existUser) throw new ForbiddenException('존재하지 않는 계정입니다.');
      const password = null;

      await this.userRepository.save({ email, password, name });

      const accessToken = await this.GoogleLoginServiceUser(email);
      return accessToken;
    } catch (err) {
      throw new err('구글로그인에 실패하였습니다.');
    }
  }

  // (3) 로그인시 JWT 토큰 발행
  async loginServiceUser(email: string) {
    try {
      const payload = { email: email }; //payload 내용이 많아질수록 네트워크 송수신에 부담이 됨
      const accessToken = this.jwtService.sign(payload);
      return accessToken;
    } catch (err) {
      throw new err('일반로그인 jwt발급에 실패하였습니다.');
    }
  }
  // (4) [구글]로그인시 JWT 토큰 발행
  async GoogleLoginServiceUser(email: string) {
    try {
      const payload = { email: email }; //payload 내용이 많아질수록 네트워크 송수신에 부담이 됨
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } catch (err) {
      throw new err('일반로그인 jwt발급에 실패하였습니다.');
    }
  }
  // (4) 로그인시 사용자 정보 반환
  async findUser(email: string) {
    try {
      const existUser = await this.userService.findByEmail(email);
      if (!existUser) throw new ForbiddenException('존재하지 않는 계정입니다.');
      const { password, createdAt, updatedAt, ...result } = existUser;
      return existUser;
    } catch (err) {
      throw new err('사용자정보 반환에 실패하였습니다.');
    }
  }

  // (4) 로그아웃시 accesstoken null 처리
  // async updateAccessToken(email: string, accessToken: string | null) {
  //   const existUser = await this.userRepository.findOne({ where: { email } });
  //   if (accessToken === null) {
  //     // existUser = null;
  //   }

  // await this.userRepository.save(existUser);
  // return { result: true, message: '로그아웃 성공' };
}
