import { ApiProperty, PickType } from "@nestjs/swagger";
import { UsersEntity } from "src/entity/user.entity";
import { IsBoolean, IsOptional, IsString } from "class-validator";
// import { UUID } from '../types/user.type';

// [계정생성 1단계] 회원가입 dto
export class SignupDto {
  @ApiProperty({ description: "DTO 이름" })
  @IsString()
  name: string;

  @ApiProperty({ description: "DTO 이메일" })
  @IsString()
  email: string;

  @ApiProperty({ description: "DTO 비밀번호" })
  @IsString()
  password: string;

  @ApiProperty({ description: "개인정보 활용 동의서" })
  @IsBoolean()
  isTermsAgreement: Boolean;

  @IsBoolean()
  @ApiProperty({ description: "개인정보 활용 동의서" })
  isPrivacyPolicyAgreement: Boolean;

  /* 마케팅 동의는 차후 진행 */
  // @ApiProperty({ description: "" })
  // isMarketingAgreement: Boolean;
  accessToken?: string | null | undefined; // 로그인 유지를 위한 토큰
}

// [계정생성 1단계] 회원가입 dto
export class addCompanyInfoDto {
  @ApiProperty({ description: "DTO 전화번호" })
  @IsString()
  phone: string;

  @ApiProperty({ description: "DTO 회사이름" })
  @IsString()
  companyName: string;

  @ApiProperty({ description: "DTO 사업자번호" })
  @IsString()
  eid: string;

  @ApiProperty({ description: "DTO email/user_id찾기위해" })
  @IsString()
  email: string;

  @ApiProperty({ description: "계정 생성하자마자 2주 trial기간 시작" })
  @IsString()
  paymentStartDate: string;

  @ApiProperty({
    description:
      "지불날짜로 부터 금액 확인후 +DAY(기본 첫 TRIAL기간에는 +14일)",
  })
  @IsString()
  paymentExpirationDate: string;
}

// [일반] 로그인 dto
export class LoginDto extends PickType(UsersEntity, ["email", "password"]) {}

// [구글] 로그인 dto
export class GoogleLoginDto extends PickType(UsersEntity, ["email", "name"]) {}

// [일반] 로그아웃 dto
export class LogoutDto {
  @ApiProperty({ description: "DTO 이메일" })
  email: string;
  accessToken?: string | null | undefined;
}

// export class RefreshTokensDto {
//   @ApiProperty({ description: '사용자 고유 id' })
//   userId: UUID;

//   @ApiProperty({ description: 'refresh token' })
//   refreshToken: string;
// }

// export class TokensDto {
//   @ApiProperty()
//   accessToken: string;

//   @ApiProperty()
//   refreshToken: string;
// }

// export class UserIdDto {
//   @ApiProperty()
//   userId: UUID;
// }

// export class TokensWithUserIdDto extends TokensDto {
//   @ApiProperty()
//   userId: UUID;
// }
