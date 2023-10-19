import { Controller, Body, Post, Res, HttpException, UseFilters } from "@nestjs/common";
import { SignupDto, addCompanyInfoDto } from "src/user/dtos/user.dto";
import { UserService } from "../user/user.service";
import { AuthService } from "src/auth/auth.service";
import { ApiOperation } from "@nestjs/swagger";
import { UserBodyDataValidationPipe } from "src/user/pipe/user-body-data-validation.pipe";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /* [계정생성 1단계] 회원가입 api */
  @Post("/signup")
  @ApiOperation({
    summary: "[계정생성 1단계] 회원가입 API",
    description: "[계정생성 1단계] 사용자 초기 계정 생성",
  })
  async signUp(@Res() res: Response, @Body(UserBodyDataValidationPipe) signupDto: SignupDto) {
    return await this.authService.signUp(res, signupDto);
  }

  /* [계정생성 2단계] 추가 회사정보 받기 api */
  @Post("/signup/addCompanyInfo")
  @ApiOperation({
    summary: "[계정생성 2단계] 추가정보받기 API",
    description: "[계정생성 2단계] 추가정보받기 API",
  })
  async addCompanyInfo(@Body() body: addCompanyInfoDto): Promise<void> {
      await this.userService.addCompanyInfo(body);
  }
}

//   /* 로그아웃(기능 없음) */
// @Post("/logout")
// // @UseGuards(JwtServiceAuthGuard)
// @ApiOperation({
//   summary: "[일반] 로그아웃 API",
//   description: "[일반] 사용자 로그아웃",
// })
// async logout(@Headers() header) {
//   return await this.authService.logout(header);
// }

// // ③ [Google] Login
// @Post('/login/google')
// @ApiOperation({
//   summary: '[구글] 로그인',
//   description:
//     '[구글] 구글로그인시 사용자의 email, name를 서버로 받아와 DB저장후 자체 AccessToken발급',
// })
// async googleLogin(
//   @Body() body: GoogleLoginDto,
//   @Res() res: any,
// ): Promise<any> {
//   const { email, name } = body; //FE에서 받아온 email
//   return await this.authService.googleLogin(res, email, name);
// }

// // (*) AuthGuard 테스트를 위한 임시 API
// @Get('/dashboard')
// @ApiOperation({
//   summary: '[일반] 모든 유저 정보 조회',
//   description: '[일반] 해당 유저의 모든 유저 조회',
// })

// @UseGuards(JwtServiceAuthGuard)
// async mypage(@Headers() headers: any) {
//   //controller단계에서 임시에러처리
//   if(!headers.authorization) return { result: false, message: '토큰이 없습니다.' };
//   console.log('===========> controller~ Headers:', headers);
//   return await this.userService.getApplicantList(headers);
// }
//------------------------------------------------------------------//
// // (*) AuthGuard 테스트를 위한 임시 API
// @Get('/dashboard')
// @ApiOperation({
//   summary: '[일반] 모든 유저 정보 조회',
//   description: '[일반] 해당 유저의 모든 유저 조회',
// })

// @UseGuards(JwtServiceAuthGuard)
// async mypage(@Headers() headers: any) {
//   //controller단계에서 임시에러처리
//   if(!headers.authorization) return { result: false, message: '토큰이 없습니다.' };
//   console.log('===========> controller~ Headers:', headers);
//   return await this.userService.getApplicantList(headers);
// }
//------------------------------------------------------------------//
