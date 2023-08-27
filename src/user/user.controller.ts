import {
  Get,
  Controller,
  Body,
  Post,
  Req,
  Res,
  UseGuards,
  Headers,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  LoginDto,
  LogoutDto,
  SignupDto,
  addCompanyInfoDto,
} from 'src/dtos/user.dto';
import { UserService } from './user.service';
// import { LocalServiceAuthGuard } from 'src/auth/guards/local-service.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service.guard';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { GoogleLoginDto } from 'src/dtos/user.dto';
import { OneToOne } from 'typeorm';
import { use } from 'passport';
@Controller('auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // ① [Common] Signup
  @Post('/signup')
  @ApiOperation({
    summary: '[일반] 회원가입 API',
    description: '[일반] 사용자 초기 계정 생성',
  })
  async signup(@Body() signupDto: SignupDto) {
    return await this.userService.signup(signupDto);
  }

  // ② [Common] Login
  @Post('/login')
  @ApiOperation({
    summary: '[일반] 로그인 API',
    description: '[일반] 사용자 로그인',
  })
  // @UseGuards(LocalServiceAuthGuard)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.authService.commonLogin(res, loginDto);
  }

  // ③ [Google] Login
  @Post('/login/google')
  @ApiOperation({
    summary: '[구글] 로그인',
    description:
      '[구글] 구글로그인시 사용자의 email, name를 서버로 받아와 DB저장후 자체 AccessToken발급',
  })
  async googleLogin(
    @Body() body: GoogleLoginDto,
    @Res() res: any,
  ): Promise<any> {
    const { email, name } = body; //FE에서 받아온 email
    console.log('===========> controller~ email:', email);
    console.log('===========> controller~ body:', body);
    const accessToken = await this.authService.googleLogin(email, name);
    res.send(accessToken);
  }

  // ④ [addInfo] addCompanyInfo
  @Post('/signup/addCompanyInfo')
  @ApiOperation({
    summary: '[추가정보] 추가정보받기 API',
    description: '[추가정보] 추가정보받기 API',
  })
  async addCompanyInfo(@Body() body: addCompanyInfoDto): Promise<void> {
    await this.userService.addCompanyInfo(body);
  }

  // ⑤ [약관동의서] agreement
  // @Post('/signup/addAgreement')
  // @ApiOperation({
  //   summary: '[약관동의서]',
  //   description: '[약관동의서]',
  // })
  // async addAgreements(@Body() body: addAgreementsDto): Promise<void> {
  //   await this.userService.addAgreements(body);
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

  // (4) [Common] Logout
  @Post('/logout')
  @UseGuards(JwtServiceAuthGuard)
  @ApiOperation({
    summary: '[일반] 로그아웃 API',
    description: '[일반] 사용자 로그아웃',
  })
  async logout(@Headers() header) {
    return await this.authService.logout(header);
  }

  // // (*) AuthGuard 테스트를 위한 임시 API
  @Get('/mypage')
  @ApiOperation({
    summary: '[일반] 본인 정보조회',
    description: '[일반] 본인 세부정보 조회, accessToken 인증',
  })
  @UseGuards(JwtServiceAuthGuard)
  async getMypage(@Headers('authorization') authorization: string) {
    const token = authorization.split(' ')[1]; // Split "Bearer <token>"
    console.log("===========> ~ token:", token)
    const decodedToken = await this.authService.verify(token);
    const result = await this.userService.getMypage(decodedToken);
    console.log('mypage조회성공');
    return result;
  }
}
