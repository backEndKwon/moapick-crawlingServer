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
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service.guard';
import { ApiOperation } from '@nestjs/swagger';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get('/mypage')
  @ApiOperation({
    summary: '[일반] 내 정보조회',
    description: '[일반] 본인 및 회사 정보 조회, verify까지는 필요 없음',
  })
  // @UseGuards(JwtServiceAuthGuard)
  async getMypage(@Headers('authorization') authorization: string) {
    const token = authorization.split(' ')[1];
    const decodedToken = await this.authService.decodeToken(token);
    const result = await this.userService.getMypage(decodedToken);
    console.log('mypage조회성공');
    return result;
  }

  @Post('/checkWantedLogin')
  @ApiOperation({
    summary: '[크롤링-원티드]로그인 체크용',
    description: '원티드 id, password를 받아서 회원정보 맞는지 체크',
  })
  async login(@Body() body) {
    return await this.userService.checkWantedLogin(body.id, body.password);
  }

  @Post('/wantedCrawling')
  @ApiOperation({
    summary: '[크롤링-원티드]지원자 가져오기용',
    description: '원티드로 지원한 지원자 정보 가져오기',
  })
  async wantedCrawling(@Body() body) {
    return await this.userService.crawlingWanted(body.id, body.password);
  }

}
