import { HttpStatus, Injectable, ForbiddenException } from '@nestjs/common';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthException } from 'src/exceptions/authException';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private jwtService: JwtService,
  ) {}

  // 로그인시 가입유무
  async validateUser(email: string, password: string): Promise<any> {
    const existUser = await this.userRepository.findOne({ where: { email } });
    if (!existUser) throw new ForbiddenException('존재하지 않는 계정입니다.');

    const validatePassword = await bcrypt.compare(password, existUser.password);
    if (!validatePassword)
      throw new ForbiddenException('비밀번호가 일치하지 않습니다.');
    //   throw new AuthException('비밀번호가 일치하지 않습니다.', HttpStatus.FORBIDDEN);
    return existUser;
  }
  async loginServiceUser(user: UsersEntity) {
    const payload = { email: user.email }; //payload 내용이 많아질수록 네트워크 송수신에 부담이 됨
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
