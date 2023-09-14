import { Injectable, ForbiddenException, Res, BadRequestException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto, SignupDto } from 'src/dtos/user.dto';
import { validatePassword } from './validations/password.validate';
import { JwtPayload } from './types/token.type';
import { config } from 'dotenv';
import { AuthException } from './exceptions/authException';
import * as argon from 'argon2';
import { CompanyEntity } from 'src/entity/company.entity';

config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // # [일반] 회원가입
  async signUp(@Res() res: any, signupDto: SignupDto) {
    const existUser = await this.userService.findByEmail(signupDto.email);
    if (!signupDto.name) {
      throw new BadRequestException('이름을 입력하세요');
    }
    if (!signupDto.email) {
      throw new BadRequestException('이메일을 입력하세요');
    }
    if (!signupDto.password) {
      throw new BadRequestException('비밀번호를 입력하세요');
    }

    try {
      const hashedPassword = await await argon.hash(signupDto.password);

      // 회원가입 후 자동 로그인 처리

      const createUserInfo = await this.userRepository.create({
        email: signupDto.email,
        name: signupDto.name,
        password: hashedPassword,
        isMarketingAgreement: signupDto.isMarketingAgreement,
        isPrivacyPolicyAgreement: signupDto.isPrivacyPolicyAgreement,
        isTermsAgreement: signupDto.isTermsAgreement,
      });
      await this.userRepository.save(createUserInfo);

      const user = await this.userRepository.findOne({
        where: { email: signupDto.email },
      });
      const accessToken = await this.signUpGenerateJwt(
        signupDto.email,
        user.createdAt,
      );
      console.log("===========> ~ accessToken:", accessToken)
      return res
        .status(HttpStatus.CREATED)
        .json({ message: '회원가입 성공', accessToken });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: '회원가입 실패' });
    }
  }

  // # [일반] 로그인
  async commonLogin(@Res() res: any, loginDto: LoginDto) {
    // validateUser 까지 가능(validate 분리예정)
    try {
      const email = loginDto.email;
      const loginUserPassword = loginDto.password;
      const userInfo = await this.findUser(email);
      const existUserPassword = userInfo.password;
      const isValidPassword = await validatePassword(
        existUserPassword,
        loginUserPassword,
      );
      if (!isValidPassword)
        throw new AuthException(
          '비밀번호가 일치하지 않습니다.',
          HttpStatus.UNAUTHORIZED,
        );
      const user = await this.userRepository.findOne({
        where: { email: email },
      });
      const accessToken = await this.signUpGenerateJwt(email, user.createdAt);
      await this.userRepository.update({ email: email }, { isLogin: true });
      const { password, ...result } = userInfo;
      res.status(200).send({ accessToken, result });
      console.log('로그인에 성공하였습니다');
    } catch (err) {
      console.log(err);
      throw new AuthException(
        '로그인에 실패하였습니다.',
        HttpStatus.UNAUTHORIZED,
      );
      
    }
  }

  // # 회원가입 후 TRIAL용 JWT 토큰 발행(모든사용자)
  async signUpGenerateJwt(email: string, createdAt: Date): Promise<string> {
    try {
      const accessTokenPayload: JwtPayload = {
        email,
        createdAt,
        issuer: 'Team Sparta - MoaPick',
        type: 'ACCESS',
      };
      //payload 내용이 많아질수록 네트워크 송수신에 부담이 됨
      const accessToken = this.jwtService.signAsync(accessTokenPayload, {
        secret: process.env.JWT_SECRETKEY,
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN_TRIAL),
      });
      console.log("===========> ~ accessToken:", accessToken)
      console.log('JWT 발급 성공');
      return accessToken;
    } catch (err) {
      throw new AuthException('JWT 발급 실패', HttpStatus.UNAUTHORIZED);
    }
  }

  // # TRIAL완료 및 결제 후 MONTHLY JWT 토큰 발행(결제완료자)
  // 결제완료 = isPaid = true, expectedAmount = 입금예정금액, depositAmount = 입금금액, depositDate = 입금일자
  async paidGenerateJwt(email: string, createdAt: Date): Promise<string> {
    try {
      // # 추후 결제 여부 확인 로직
      // const isPaid = this.companyRepository.findOne({ where: { user_id } });
      // if(!isPaid) throw new AuthException('결제가 완료되지 않았습니다.', HttpStatus.UNAUTHORIZED);

      const user = await this.userRepository.findOne({ where: { email } });
      const company = await this.companyRepository.findOne({
        where: { user_id: user.user_id },
      });

      if ((company.isPaid = true)) {
        const accessTokenPayload: JwtPayload = {
          email,
          createdAt,
          issuer: 'Team Sparta - MoaPick',
          type: 'ACCESS',
        };
        //
        const paymentDate = new Date('2023-03-02'); // 사용자가 결제한 날짜
        const expiresAfterDays = 30; // 30일 만료 기간
        const expirationDate = new Date(paymentDate);
        expirationDate.setDate(paymentDate.getDate() + expiresAfterDays);

        // 계산된 만료 날짜를 환경 변수에 설정
        process.env.JWT_EXPIRES_IN_BASIC = expirationDate.toISOString();
        const accessToken = this.jwtService.signAsync(accessTokenPayload, {
          secret: process.env.JWT_SECRETKEY,
          expiresIn: parseInt(process.env.JWT_EXPIRES_IN_TRIAL),
        });
        console.log('JWT 발급 성공');
        return accessToken;
      }
    } catch (err) {
      throw new AuthException('JWT 발급 실패', HttpStatus.UNAUTHORIZED);
    }
  }

  // // # [구글]로그인시 JWT 토큰 발행
  // async GoogleLoginServiceUser(
  //   email: string,
  //   createdAt: Date,
  // ): Promise<string> {
  //   try {
  //     return await this.generateJwt(email);
  //   } catch (err) {
  //     throw new AuthException('JWT 발급 실패', HttpStatus.UNAUTHORIZED);
  //   }
  // }

  // // # [구글] 로그인
  // async googleLogin(@Res() res: any, email: string, name: string) {
  //   try {
  //     const existUser = await this.userRepository.findOne({ where: { email } });
  //     if (!existUser) throw new ForbiddenException('존재하지 않는 계정입니다.');
  //     const password = null;

  //     await this.userRepository.save({ email, password, name });

  //     const accessToken = await this.GoogleLoginServiceUser(email);
  //     existUser.accessToken = accessToken;
  //     await this.userRepository.save(existUser);
  //     res.status(200).send({ accessToken });
  //   } catch (err) {
  //     throw new AuthException('구글로그인 실패', HttpStatus.UNAUTHORIZED);
  //   }
  // }

  // # 로그인시 사용자 정보 반환
  async findUser(email: string) {
    try {
      const existUser = await this.userService.findByEmail(email);
      existUser.isLogin = true;
      await this.userRepository.save(existUser);
      if (!existUser) throw new ForbiddenException('존재하지 않는 계정입니다.');
      const {
        createdAt,
        updatedAt,
        isMarketingAgreement,
        isPrivacyPolicyAgreement,
        isTermsAgreement,
        ...result
      } = existUser;
      return result;
    } catch (err) {
      throw new AuthException('사용자 정보 조회 실패', HttpStatus.UNAUTHORIZED);
    }
  }
  async decodeToken(token: string) {
    try {
      const decoded = this.jwtService.decode(token);
      console.log(decoded);
      if (!decoded) throw new ForbiddenException('토큰이 존재하지 않습니다.');
      return decoded;
    } catch (err) {
      throw new AuthException('JWT 디코딩 실패', HttpStatus.UNAUTHORIZED);
    }
  }

  // () 로그아웃시 accesstoken null 처리
  async logout(header) {
    try {
      const { email } = header;
      const existUser = await this.userService.findByEmail(email);

      existUser.isLogin = false;
      existUser.accessToken = null;
      await this.userRepository.save(existUser);
      const accessToken = null;
      console.log('로그아웃 성공');
      return { accessToken, existUser };
    } catch (err) {
      throw new AuthException('로그아웃 실패', HttpStatus.UNAUTHORIZED);
    }
  }

  async verify(token: string) {
    try {
      console.log("verify 도달")
      // const verifyToken = await this.jwtService.verify(token);
      return await this.jwtService.verify(token);

      // console.log('===========> ~ verifyToken:', verifyToken);
      // console.log('토큰 인증 성공!');
      // return verifyToken;
    } catch (err) {
      throw new UnauthorizedException('토큰 인증 실패다');
    }
  }

  



}
