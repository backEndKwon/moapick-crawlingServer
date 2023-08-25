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
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  // (1) [일반] 로그인
  async commonLogin(user: LoginDto) {
    // validateUser 까지 가능(validate 분리예정)
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
      await this.userRepository.update({email:email}, {isLogin:true})
      return { accessToken, userInfo };
    } catch (err) {
      console.log(err);
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
  async decodeToken(token: string) {
    try {
      const decoded = this.jwtService.decode(token);
      console.log(decoded)
      if (!decoded) throw new ForbiddenException('토큰이 존재하지 않습니다.');
      return decoded;
    } catch (err) {
      throw new err('토큰 디코딩에 실패하였습니다.');
    }
  }




  // () 로그아웃시 accesstoken null 처리
  async logout(header) {
    
    const accessToken = null
    
  return accessToken ;
}}
