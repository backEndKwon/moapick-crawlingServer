import { Get, Controller, Body, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto, SignupDto } from 'src/dtos/user.dto';
import { UserService } from './user.service';
import { LocalServiceAuthGuard } from 'src/auth/guards/local-service.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service.guard';
@Controller('auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.userService.signup(signupDto);
  }

  @UseGuards(LocalServiceAuthGuard)
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const accessToken = await this.authService.loginServiceUser(req.user);
    return accessToken;
    // return await this.userService.login(signupDto);
  }

  //AuthGuard 테스트를 위한 임시 API
  @UseGuards(JwtServiceAuthGuard)
  @Get('/mypage')
  async mypage() {
    return { result: true, message: 'mypage 조회 성공' };
  }
}
