import {
  Get,
  Controller,
  Body,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginDto, LogoutDto, SignupDto } from 'src/dtos/user.dto';
import { UserService } from './user.service';
import { LocalServiceAuthGuard } from 'src/auth/guards/local-service.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service.guard';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import{GoogleLoginDto} from 'src/dtos/user.dto'
@Controller('auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // (1) 회원가입
  @Post('/signup')
  @ApiOperation({
    summary: '[일반] 회원가입 API',
    description: '[일반] 사용자 초기 계정 생성',
  })
  async signup(@Body() signupDto: SignupDto) {
    return await this.userService.signup(signupDto);
  }

  // (2) [일반]로그인
  @Post('/login')
  @ApiOperation({
    summary: '[일반] 로그인 API',
    description: '[일반] 사용자 로그인',
  })
  @UseGuards(LocalServiceAuthGuard)
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const accessToken = await this.authService.loginServiceUser(req.user.email);
    const user = await this.authService.findUser(req.user.email);
    return { accessToken, user };
    // return await this.userService.login(signupDto);
  }

  // // (3) [일반]로그아웃
  // @Post('/logout')
  // @UseGuards(JwtServiceAuthGuard)
  // @ApiOperation({
  //   summary: '[일반] 로그아웃 API',
  //   description: '[일반] 사용자 로그아웃',
  // })
  // async logout(@Body() logoutDto: LogoutDto) {
  //   return await this.userService.logout(logoutDto);
  // }

  // (4) Google 로그인
  @Post('/login/google')
  @ApiOperation({
    summary: '[구글] 로그인',
    description: '[구글] 구글로그인시 사용자의 email, name를 서버로 받아와 DB저장후 자체 AccessToken발급',
  })
  async googleLogin(@Body() body: GoogleLoginDto, @Res() res: any): Promise<any> {
    const {email, name } = body; //FE에서 받아온 email
    console.log('===========> controller~ email:', email);
    console.log('===========> controller~ body:', body);
    const accessToken = await this.authService.googleLogin(email,name);
    res.send(accessToken);
  }

  // (4) AuthGuard 테스트를 위한 임시 API
  @Get('/mypage')
  @ApiOperation({
    summary: '[일반] 본인 정보조회',
    description: '[일반] 본인 세부정보 조회, accessToken 인증',
  })
  @UseGuards(JwtServiceAuthGuard)
  async mypage() {
    return { result: true, message: 'mypage 조회 성공' };
  }
}
