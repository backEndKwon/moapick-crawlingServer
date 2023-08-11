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
    console.log("===========> ~ email:", email)
    const existUser = await this.userRepository.findOne({ where: { email } });
    return existUser;
  }

  // 비밀번호 암호화 // argon2변경 전
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 11);
  }
  // 사용자 생성 및 저장
  async createUser(
    email: string,
    password: string|null,
    name: string,
    phone: string,
  ) {
    return await this.userRepository.save({ name, email, password, phone });
  }

  // // 로그아웃
  // async logout() {

  // }
}
