import { Get, Controller, Body, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto, LogoutDto, SignupDto } from 'src/dtos/user.dto';
import { UserService } from './user.service';
import { LocalServiceAuthGuard } from 'src/auth/guards/local-service.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service.guard';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
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

  // (2) 로그인
  @Post('/login')
  @ApiOperation({
    summary: '[일반] 로그인 API',
    description: '[일반] 사용자 로그인',
  })
  @UseGuards(LocalServiceAuthGuard)
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const accessToken = await this.authService.loginServiceUser(req.user);
    const user = await this.authService.findUser(req.user.email);
    return { accessToken, user };
    // return await this.userService.login(signupDto);
  }

  // // (3) 로그아웃
  // @Post('/logout')
  // @UseGuards(JwtServiceAuthGuard)
  // @ApiOperation({
  //   summary: '[일반] 로그아웃 API',
  //   description: '[일반] 사용자 로그아웃',
  // })
  // async logout(@Body() logoutDto: LogoutDto) {
  //   return await this.userService.logout(logoutDto);
  // }

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
