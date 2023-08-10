import { ApiProperty, PickType } from '@nestjs/swagger';
import { UsersEntity } from 'src/entity/user.entity';
// import { UUID } from '../types/user.type';

export class SignupDto {
  @ApiProperty({ description: 'DTO 이메일' })
  email: string;

  @ApiProperty({ description: 'DTO 비밀번호' })
  password: string;

  @ApiProperty({ description: 'DTO 이름' })
  name: string;

  @ApiProperty({ description: 'DTO 전화번호' })
  phone: string;

}

export class LoginDto extends PickType(UsersEntity, ['email', 'password']) {}

export class LogoutDto {
  @ApiProperty({ description: '이메일' })
  email: string;
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
