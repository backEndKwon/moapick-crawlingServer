import { Injectable, HttpStatus, ConflictException } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthException } from 'src/exceptions/authException';
import { SignupDto } from 'src/dtos/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private readonly configService: ConfigService,
  ) {}

  // (1) 회원가입
  async signup(signupDto: SignupDto) {
    await this.findByEmail(signupDto.email);
    const hashedPassword = await this.hashPassword(signupDto.password);

    return await this.createUser(
      signupDto.email,
      hashedPassword,
      signupDto.name,
      signupDto.phone,
    );
  }

  // email로 사용자 조회
  async findByEmail(email: string) {
    const existUser = await this.userRepository.findOne({ where: { email } });
    if (existUser) {
      throw new ConflictException('존재하지 않는 계정입니다.')
    }
    return existUser;
  }

  // 비밀번호 암호화
  async hashPassword(password: string) {
    return await bcrypt.hash(password, this.configService.get<string>('HASH_PASSWORD_LEVEL'));
  }
  // 사용자 생성 및 저장
  async createUser(
    email: string,
    password: string,
    name: string,
    phone: string,
  ) {
    return await this.userRepository.save({ name, email, password, phone });
  }

  // // 로그아웃
  // async logout() {

  // }
}
