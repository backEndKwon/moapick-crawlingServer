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
import { ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import {
  checkJobplanetLogin,
  checkProgrammersLogin,
  checkRocketPunchLogin,
  checkWantedLogin,
  crawlingJobplanet,
  crawlingProgrammers,
  crawlingRocketPunch,
  crawlingWanted,
} from "src/crawling/main.crawling";
import { crawlingWantedCompanyList } from "src/crawling/wanted/wantedCompanyList";
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
    summary: "[계정확인-원티드]로그인 체크용",
    description: "원티드 id, password를 받아서 회원정보 맞는지 체크",
  })
  async login(@Body() body) {
    console.log(`${body.id}님이 원티드 계정 등록을 시도하였습니다`);

    return await checkWantedLogin(body.id, body.password);
  }

  @Post("/wantedCrawling")
  @ApiOperation({
    summary: "[크롤링-원티드]지원자 가져오기용",
    description: `사용자 로컬에 저장된 채용계정 정보를 body값으로 가져와서 로그인과 크롤링을 동시에 실행`,
  })
  async wantedCrawling(@Body() body) {
    console.log(`${body.id}님이 원티드 크롤링을 시도하였습니다`);
    return await crawlingWanted(body.id, body.password);
  }

  // (2) 로켓펀치
  @Post("/checkRocketPuchLogin")
  @ApiOperation({
    summary: "[계정확인-로켓펀치]로그인 체크용",
    description: "로켓펀치 id, password를 받아서 회원정보 맞는지 체크",
  })
  async checkRocketPunchLogin(@Body() body) {
    console.log(`${body.email}님이 로켓펀치 계정 등록을 시도하였습니다`);
    return await checkRocketPunchLogin(body.email, body.password);
  }

  @Post("/rocketPunchCrawling")
  @ApiOperation({
    summary: "[크롤링-로켓펀치]지원자 정보 크롤링",
    description:
      "사용자 로컬에 저장된 채용계정 정보를 body값으로 가져와서 로그인과 크롤링을 동시에 실행",
  })
  async rocketPunchCrawling(@Body() body) {
    console.log(`${body.email}님이 로켓펀치 크롤링을 시도하였습니다`);
    return await crawlingRocketPunch(body.email, body.password);
  }

  // (3) 프로그래머스
  @Post("/checkProgrammersLogin")
  @ApiOperation({
    summary: "[계정확인-프로그래머스]로그인 체크용",
    description: "프로그래머스 id, password를 받아서 회원정보 맞는지 체크",
  })
  async checkProgrammersLogin(@Body() body) {
    console.log(`${body.email}님이 프로그래머스 계정 등록을 시도하였습니다`);
    return await checkProgrammersLogin(body.email, body.password);
  }

  @Post("/programmersCrawling")
  @ApiOperation({
    summary: "[크롤링-로켓펀치]지원자 정보 크롤링",
    description:
      "사용자 로컬에 저장된 채용계정 정보를 body값으로 가져와서 로그인과 크롤링을 동시에 실행",
  })
  async programmersCrawling(@Body() body) {
    console.log(`${body.email}님이 프로그래머스 크롤링을 시도하였습니다`);
    return await crawlingProgrammers(body.email, body.password);
  }

  // (4) 잡플래닛
  @Post("/checkJobplanetLogin")
  @ApiOperation({
    summary: "[계정확인-프로그래머스]로그인 체크용",
    description: "프로그래머스 id, password를 받아서 회원정보 맞는지 체크",
  })
  async checkJobplanetLogin(@Body() body) {
    console.log(`${body.email}님이 잡플래닛 계정 등록을 시도하였습니다`);
    return await checkJobplanetLogin(body.email, body.password);
  }

  @Post("/jobplanetCrawling")
  @ApiOperation({
    summary: "[크롤링-잡플래닛]지원자 정보 크롤링",
    description:
      "사용자 로컬에 저장된 채용계정 정보를 body값으로 가져와서 로그인과 크롤링을 동시에 실행",
  })
  async jobplanetCrawling(@Body() body) {
    console.log(`${body.email}님이 잡플래닛 크롤링을 시도하였습니다`);
    const result = await crawlingJobplanet(body.email, body.password);
    console.log(`${result.length}명의 지원자 정보를 가져왔습니다.`);
    return result;
  }

  // 내 정보조회(프로필 및 계정 전시용)
  @Get("/mypage")
  @ApiOperation({
    summary: "[일반] 내 정보조회",
    description: "[일반] 본인 및 회사 정보 조회, 토큰인증",
  })
  @UseGuards(AuthGuard(""))
  async getMypage(@Headers("Authorization") Authorization: string) {
    const token = Authorization.split(" ")[1];
    const decodedToken = await this.authService.decodeToken(token);
    const result = await this.userService.getMypage(decodedToken);
    return result.result;
  }

  @Get("/crawlingWantedCompanyList")
  @ApiOperation({
    summary: "[영업용] 원티드에 공고 등록한 회사 리스트업",
    description:
      "원티드에 채용 공고를 등록한 회사만 리스트업해서 비교적 유효한 타켓군으로 구성",
  })
  async crawlingWantedCompany() {
    const result = await crawlingWantedCompanyList();
    return result;
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
