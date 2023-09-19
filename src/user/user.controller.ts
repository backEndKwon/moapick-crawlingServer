import {
  Get,
  Controller,
  Body,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
// import { JwtServiceAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("/checkWantedLogin")
  @ApiOperation({
    summary: "[크롤링-원티드]로그인 체크용",
    description: "원티드 id, password를 받아서 회원정보 맞는지 체크",
  })
  async login(@Body() body) {
    return await this.userService.checkWantedLogin(body.id, body.password);
  }

  @Post("/wantedCrawling")
  @ApiOperation({
    summary: "[크롤링-원티드]지원자 가져오기용",
    description: "원티드로 지원한 지원자 정보 가져오기",
  })
  async wantedCrawling(@Body() body) {
    return await this.userService.crawlingWanted(body.id, body.password);
  }

  @Post('/checkRocketPuchLogin')
  @ApiOperation({
    summary: '[크롤링-로켓펀치]로그인 체크용',
    description: '로켓펀치 id, password를 받아서 회원정보 맞는지 체크',
  })
  async checkRocketPunchLogin(@Body() body) {
    return await this.userService.checkRocketPunchLogin(body.email, body.password);
  }

  @Post('/rocketPunchCrawling')
  @ApiOperation({
    summary: '[크롤링-로켓펀치]지원자 정보 크롤링',
    description: '지원자 정보 크롤링',
  })
  async rocketPunchCrawling(@Body() body) {
    return await this.userService.crawlingRocketPunch(body.email, body.password);
  }

  // jwt verify test
  @Get('/mypage')
  @ApiOperation({
    summary: '[일반] 내 정보조회',
    description: '[일반] 본인 및 회사 정보 조회, verify까지는 필요 없음',
  })
  @UseGuards(AuthGuard())
  async getMypage(@Headers('Authorization') Authorization: string) {
    const token = Authorization.split(' ')[1];
    const decodedToken = await this.authService.decodeToken(token);
    const result = await this.userService.getMypage(decodedToken);
    console.log("===========> ~ result.result:", result.result)
    return result.result;
  }
}
