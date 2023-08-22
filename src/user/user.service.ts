import {
  Injectable,
  HttpStatus,
  NotAcceptableException,
  ConflictException,
} from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { SignupDto, addCompanyInfoDto } from 'src/dtos/user.dto';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { CompanyEntity } from 'src/entity/company.entity';
import { AuthService } from 'src/auth/auth.service';
import { ApplicantEntity } from 'src/entity/applicant.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    @InjectRepository(ApplicantEntity)
    private readonly applicantRepository: Repository<ApplicantEntity>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // (1) 회원가입
  async signup(signupDto: SignupDto) {
    await this.findByEmail(signupDto.email);
    const hashedPassword = await this.hashPassword(signupDto.password);

    const createUserInfo = await this.userRepository.create({
      email: signupDto.email,
      name: signupDto.name,
      password: hashedPassword,
    });
    return await this.userRepository.save(createUserInfo);
  }

  // (2) Email로 사용자 조회(회원가입)
  async findByEmail(email: string) {
    const existUser = await this.userRepository.findOne({ where: { email } });
    return existUser;
  }

  // (3) 비밀번호 암호화(회원가입) // argon2변경 전
  async hashPassword(password: string) {
    return await argon.hash(password);
  }

  // (4) 사용자 [추가정보] 생성 및 저장(회원가입)
  async addCompanyInfo(body: addCompanyInfoDto) {
    const { email, phone, companyName, eid } = body;
    if (!email) {
      throw new NotAcceptableException('이메일을 입력해주세요.');
    }
    if (!phone) {
      throw new NotAcceptableException('전화번호를 입력해주세요.');
    }
    if (!companyName) {
      throw new NotAcceptableException('회사명을 입력해주세요.');
    }
    if (!email) {
      throw new NotAcceptableException('사업자번호를 입력해주세요.');
    }
    const existUser = await this.findByEmail(email);
    if (!existUser) {
      throw new NotAcceptableException('존재하지 않는 사용자입니다.');
    }
    existUser.phone = phone;
    await this.userRepository.save(existUser);
    const existUserId = existUser.user_id;
    const createCompanyInfo = this.companyRepository.create({
      user_id: existUserId,
      eid,
    });
    await this.companyRepository.save(createCompanyInfo);
  }
  async getApplicantList(headers: string) {
    const token = headers.split(' ')[1];
    const userToken = await this.authService.decodeToken(token);
    const email = userToken['email'];
    console.log('===========> ~ email:', email);
    if (!email) {
      throw new NotAcceptableException('존재하지 않는 사용자입니다.');
    }
    const user = await this.findByEmail(email);
    const company = await this.companyRepository.findOne({
      where: { user_id: user.user_id },
    });
    const applicantList = await this.applicantRepository.findOne({
      where: { company_id: company.company_id },
    });
    console.log('===========> ~ applicantList:', applicantList);
    return applicantList;
  }

  // // 로그아웃
  // async logout() {
  // }
}
