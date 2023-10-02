import {
  Get,
  Controller,
  Body,
  Post,
  UseGuards,
  Headers,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthService } from "src/auth/auth.service";
// import { JwtServiceAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /* 크롤링 */
  // (1) 원티드
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
    console.log(`${body.id}님이 원티드 크롤링을 시도하였습니다`);
    return await this.userService.crawlingWanted(body.id, body.password);
  }

  // (2) 로켓펀치
  @Post("/checkRocketPuchLogin")
  @ApiOperation({
    summary: "[크롤링-로켓펀치]로그인 체크용",
    description: "로켓펀치 id, password를 받아서 회원정보 맞는지 체크",
  })
  async checkRocketPunchLogin(@Body() body) {
    return await this.userService.checkRocketPunchLogin(
      body.email,
      body.password,
    );
  }

  @Post("/rocketPunchCrawling")
  @ApiOperation({
    summary: "[크롤링-로켓펀치]지원자 정보 크롤링",
    description: "지원자 정보 크롤링",
  })
  async rocketPunchCrawling(@Body() body) {
    console.log(`${body.email}님이 로켓펀치 크롤링을 시도하였습니다`);
    return await this.userService.crawlingRocketPunch(
      body.email,
      body.password,
    );
  }

  // (3) 프로그래머스
  @Post("/checkProgrammersLogin")
  @ApiOperation({
    summary: "[크롤링-프로그래머스]로그인 체크용",
    description: "프로그래머스 id, password를 받아서 회원정보 맞는지 체크",
  })
  async checkProgrammersLogin(@Body() body) {
    return await this.userService.checkProgrammersLogin(
      body.email,
      body.password,
    );
  }

  @Post("/programmersCrawling")
  @ApiOperation({
    summary: "[크롤링-로켓펀치]지원자 정보 크롤링",
    description: "지원자 정보 크롤링",
  })
  async programmersCrawling(@Body() body) {
    return await this.userService.crawlingProgrammers(
      body.email,
      body.password,
    );
  }

  // (4) 잡플래닛
  @Post("/checkJobplanetLogin")
  @ApiOperation({
    summary: "[크롤링-프로그래머스]로그인 체크용",
    description: "프로그래머스 id, password를 받아서 회원정보 맞는지 체크",
  })
  async checkJobplanetLogin(@Body() body) {
    return await this.userService.checkJobplanetLogin(
      body.email,
      body.password,
    );
  }

  @Post("/jobplanetCrawling")
  @ApiOperation({
    summary: "[크롤링-잡플래닛]지원자 정보 크롤링",
    description: "지원자 정보 크롤링",
  })
  async jobplanetCrawling(@Body() body) {
    console.log(`${body.email}님이 잡플래닛 크롤링을 시도하였습니다`);
    return await this.userService.crawlingJobplanet(body.email, body.password);
  }
  // jwt verify test
  @Get("/mypage")
  @ApiOperation({
    summary: "[일반] 내 정보조회",
    description: "[일반] 본인 및 회사 정보 조회, verify까지는 필요 없음",
  })
  @UseGuards(AuthGuard())
  async getMypage(@Headers("Authorization") Authorization: string) {
    const token = Authorization.split(" ")[1];
    const decodedToken = await this.authService.decodeToken(token);
    const result = await this.userService.getMypage(decodedToken);
    console.log("===========> ~ result.result:", result.result);
    return result.result;
  }
}

// // 나인하이어
// @Post("/checkNinehireLogin")
// @ApiOperation({
//   summary: "[크롤링-나인하이어]로그인 체크용",
//   description: "나인하이어 id, password를 받아서 회원정보 맞는지 체크",
// })
// async checkNinehireLogin(@Body() body) {
//   return await this.userService.checkNinehireLogin(body.email, body.password);
// }

// @Post("/ninehirePostIdCrawling")
// @ApiOperation({
//   summary: "[크롤링-나인하이어]지원자 등록",
//   description: "지원자 등록용 크롤링",
// })
// async ninehirePostIdCrawling(@Body() body) {
//   return await this.userService.crawlingNinehirePostId(
//     body.email,
//     body.password,
//   );
// }

// @Post("/ninehireCrawling")
// @ApiOperation({
//   summary: "[크롤링-나인하이어]지원자 등록",
//   description: "지원자 등록용 크롤링",
// })
// async ninehireCrawling(@Body() body) {
//   console.log(`${body.email}님이 나인하이어 크롤링을 시도하였습니다`);
//   return await this.userService.crawlingNinehire(body.email, body.password);
// }
