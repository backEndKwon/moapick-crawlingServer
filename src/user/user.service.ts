import {
  Injectable,
  HttpStatus,
  NotAcceptableException,
  ConflictException,
} from '@nestjs/common';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { SignupDto, addCompanyInfoDto } from 'src/dtos/user.dto';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { CompanyEntity } from 'src/entity/company.entity';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  // (1) 회원가입
  async signup(signupDto: SignupDto) {
    await this.findByEmail(signupDto.email);
    const hashedPassword = await this.hashPassword(signupDto.password);

    const createUserInfo = await this.userRepository.create({
      email: signupDto.email,
      name: signupDto.name,
      isMarketingAgreement: signupDto.isMarketingAgreement,
      isPrivacyPolicyAgreement: signupDto.isPrivacyPolicyAgreement,
      isTermsAgreement: signupDto.isTermsAgreement,
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
    const { email, companyName, eid, phone } = body;
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
    await this.userRepository.save(existUser);
    const existUserId = existUser.user_id;
    const createCompanyInfo = this.companyRepository.create({
      user_id: existUserId,
      phone,
      eid,
      grade: 'trial', //tiral은 2주 무료
    });

    await this.companyRepository.save(createCompanyInfo);
  }

  // (5) 약관동의서 저장
  //   async addAgreements(body: addAgreementsDto) {
  //     const {
  //       email,
  //       isTermsAgreement,
  //       isPrivacyPolicyAgreement,
  //       isMarketingAgreement,
  //     } = body;
  //     const existUser = await this.userRepository.findOne({ where: { email } });
  //     existUser.isTermsAgreement = isTermsAgreement;
  //     (existUser.isPrivacyPolicyAgreement = isPrivacyPolicyAgreement),
  //       (existUser.isMarketingAgreement = isMarketingAgreement);
  //     try {
  //       await this.userRepository.save(existUser);
  //       console.log('약관동의서 저장 성공');
  //     } catch (err) {
  //       console.log('약관동의서 저장 실패', err);
  //     }
  //   }
  // }
}
