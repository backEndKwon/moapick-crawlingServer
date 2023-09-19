import { ApiProperty, PickType } from "@nestjs/swagger";
import { UsersEntity } from "src/entity/user.entity";
// import { IsOptional, IsString } from 'class-validator';
// import { UUID } from '../types/user.type';

// [일반] 회원가입 dto
export class SignupDto {
  @ApiProperty({ description: "DTO 이름" })
  name: string;
  @ApiProperty({ description: "DTO 이메일" })
  email: string;

  @ApiProperty({ description: "DTO 비밀번호" })
  password: string;

  @ApiProperty({ description: "" })
  isTermsAgreement: Boolean;

  @ApiProperty({ description: "" })
  isPrivacyPolicyAgreement: Boolean;

  @ApiProperty({ description: "" })
  isMarketingAgreement: Boolean;

  accessToken?: string | null | undefined;
}

// [추가정보] 추가정보 dto
export class addCompanyInfoDto {
  @ApiProperty({ description: "DTO 전화번호" })
  phone: string;

  @ApiProperty({ description: "DTO 회사이름" })
  companyName: string;

  @ApiProperty({ description: "DTO 사업자번호" })
  eid: string;

  @ApiProperty({ description: "DTO email/user_id찾기위해" })
  email: string;
  
  @ApiProperty({ description: '계정 생성하자마자 2주 trial기간 시작' })
  paymentStartDate: string;

  @ApiProperty({ description: '지불날짜로 부터 금액 확인후 +DAY(기본 첫 TRIAL기간에는 +14일)' })
  paymentExpirationDate : string;
  
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
