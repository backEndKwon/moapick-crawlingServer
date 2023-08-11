import { HttpStatus, Injectable, ForbiddenException } from '@nestjs/common';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthException } from 'src/exceptions/authException';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // (1) 로그인시 비밀번호 검증
  async validateUser(email: string, password: string): Promise<any> {
    const existUser = await this.userRepository.findOne({ where: { email } });
    if (!existUser) throw new ForbiddenException('존재하지 않는 계정입니다.');

    const validatePassword = await bcrypt.compare(password, existUser.password);
    if (!validatePassword)
      throw new ForbiddenException('비밀번호가 일치하지 않습니다.');
    //   throw new AuthException('비밀번호가 일치하지 않습니다.', HttpStatus.FORBIDDEN);
    return existUser;
  }

  // (2) 로그인시 JWT 토큰 발행
  async loginServiceUser(email: string) {
    const payload = { email: email }; //payload 내용이 많아질수록 네트워크 송수신에 부담이 됨
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }
  // (2) 로그인시 JWT 토큰 발행
  async GoogleLoginServiceUser(email: string) {
    const payload = { email: email }; //payload 내용이 많아질수록 네트워크 송수신에 부담이 됨
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
  // (3) 로그인시 사용자 정보 반환
  async findUser(email: string) {
    const existUser = await this.userService.findByEmail(email);
    if (!existUser) throw new ForbiddenException('존재하지 않는 계정입니다.');
    const { password, createdAt, updatedAt, ...result } = existUser;
    return result;
  }

  // (4) 로그아웃시 accesstoken null 처리
  // async updateAccessToken(email: string, accessToken: string | null) {
  //   const existUser = await this.userRepository.findOne({ where: { email } });
  //   if (accessToken === null) {
  //     // existUser = null;
  //   }

  // await this.userRepository.save(existUser);
  // return { result: true, message: '로그아웃 성공' };

  async googleLogin(email: string, name: string) {
    console.log('===========> ~ email:', email);
    // try {
    const existUser = await this.userRepository.findOne({ where: { email } });
    console.log('===========> ~ existUser:', existUser);
    if (existUser) throw new ForbiddenException('이미 존재하는 계정입니다.');
    const password = null;

    await this.userRepository.save({ email, password, name });

    const accessToken = await this.GoogleLoginServiceUser(email);
    return { accessToken };
    // } catch (err) {
    //   console.log("===========> ~ err:", err)

    //   throw new ForbiddenException('구글로그인에 실패하였습니다.');
    // }
  }
}
