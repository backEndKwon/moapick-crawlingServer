import { Injectable, HttpStatus } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthException } from 'src/exceptions/authException';
import { SignupDto } from 'src/dtos/user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {}

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

  async findByEmail(email: string) {
    const existUser = await this.userRepository.findOne({ where: { email } });
    if (existUser) {
      throw new AuthException(
        '이미 존재하는 이메일입니다.',
        HttpStatus.CONFLICT,
      );
    }
    return existUser;
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 11);
  }
  
  async createUser(
    email: string,
    password: string,
    name: string,
    phone: string,
  ) {
    return await this.userRepository.save({ name, email, password, phone });
  }
}
