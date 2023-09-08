import {
  Get,
  Controller,
  Body,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { LoginDto } from 'src/dtos/user.dto';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtServiceAuthGuard } from 'src/auth/guards/jwt-service.guard';
import { ApiOperation } from '@nestjs/swagger';
import { GoogleLoginDto } from 'src/dtos/user.dto';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // // (*) AuthGuard 테스트를 위한 임시 API
  @Get('/mypage')
  @ApiOperation({
    summary: '[일반] 본인 정보조회',
    description: '[일반] 본인 세부정보 조회, accessToken 인증',
  })
  @UseGuards(JwtServiceAuthGuard)
  async getMypage(@Headers('authorization') authorization: string) {
    const token = authorization.split(' ')[1]; // Split "Bearer <token>"
    console.log('===========> ~ token:', token);
    const decodedToken = await this.authService.verify(token);
    const result = await this.userService.getMypage(decodedToken);
    console.log('mypage조회성공');
    return result;
  }
  @Post('/crawling')
  async wantedCrawling(@Body() body) {
    const {id, password}= body
    console.log("===========> ~ body:", body)
    const answer = await this.userService.wantedCrawling(id, password)
    console.log("===========> ~ answer:", answer)
    return answer;
  }


}
