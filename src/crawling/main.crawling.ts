/* 크롤링 */

import { BadRequestException } from "@nestjs/common";
import { wantedLoginCheck } from "./wanted/checkWantedLogin";
import { wantedCrawling } from "./wanted/wantedCrawling";
import { RocketPunchLoginCheck } from "./rocketPunch/checkRocketPunchLogin";
import { CrawlingRocketPunch } from "./rocketPunch/rocketPunchCrawling";
import { programmersLoginCheck } from "./programmers/checkProgrammersLogin";
import { programmersCrawling } from "./programmers/programmersCrawling";
import { JobplanetLoginCheck } from "./jobplanet/checkjobplanetLogin";
import { CrawlingJobplanet } from "./jobplanet/jobplanetCrawling";

// (1)-1 원티드 로그인
export async function checkWantedLogin(ID: string, PW: string) {
  try {
    const result = await wantedLoginCheck(ID, PW);
    console.log("=====>원티드 로그인 확인");
    return { message: "원티드 로그인이 확인되었습니다.", result };
  } catch (error) {
    console.log("=====>원티드 로그인 실패");
    throw error;
  }
}
// (1)-2 원티드
export async function crawlingWanted(id: string, password: string) {
  try {
    if (!id || !password) {
      throw new BadRequestException("아이디와 비밀번호를 입력해주세요.");
    }

    const result = await wantedCrawling(id, password);
    console.log("=====>원티드 크롤링 확인");
    return result;
  } catch (error) {
    console.log("=====>원티드 크롤링 실패");
    throw error;
  }
}

// (2)-1 로켓펀치 로그인
export async function checkRocketPunchLogin(ID: string, PW: string) {
  try {
    const result = await RocketPunchLoginCheck(ID, PW);
    console.log("=====>로켓펀치 로그인 확인");
    return { message: " 로켓펀치 로그인이 확인되었습니다.", result };
  } catch (error) {
    console.log("=====>로켓펀치 로그인 실패");
    throw error;
  }
}

// (2)-2 로켓펀치
export async function crawlingRocketPunch(id: string, password: string) {
  try {
    if (!id || !password) {
      throw new BadRequestException("아이디와 비밀번호를 입력해주세요.");
    }
    const result = await CrawlingRocketPunch(id, password);
    console.log("=====>로켓펀치 크롤링 확인");
    return result;
  } catch (error) {
    console.log("=====>로켓펀치 크롤링 실패");
    throw error;
  }
}

// (3)-1 프로그래머스 로그인
export async function checkProgrammersLogin(ID: string, PW: string) {
  try {
    const result = await programmersLoginCheck(ID, PW);
    console.log("=====>프로그래머스 로그인 완료");
    return { message: " 프로그래머스 로그인이 확인되었습니다.", result };
  } catch (error) {
    console.log("=====>프로그래머스 로그인 실패");
    throw error;
  }
}

// (3)-2 프로그래머스
export async function crawlingProgrammers(id: string, password: string) {
  console.log(id, password);
  try {
    if (!id || !password) {
      throw new BadRequestException("아이디와 비밀번호를 입력해주세요.");
    }

    const result = await programmersCrawling(id, password);
    console.log("=====>프로그래머스 크롤링 완료");
    return result;
  } catch (error) {
    console.log("=====>프로그래머스 크롤링 실패");
    throw error;
  }
}

// (4)-1 잡플래닛 로그인
export async function checkJobplanetLogin(ID: string, PW: string) {
  try {
    const result = await JobplanetLoginCheck(ID, PW);
    console.log("=====> 잡플래닛 로그인 확인");
    return { message: " 잡플래닛 로그인이 확인되었습니다.", result };
  } catch (error) {
    console.log("=====> 잡플래닛 로그인 실패");
    throw error;
  }
}

// (4)-2 잡플래닛
export async function crawlingJobplanet(id: string, password: string) {
  try {
    const result = await CrawlingJobplanet(id, password);
    console.log("=====> 잡플래닛 크롤링 확인");
    return result;
  } catch (error) {
    console.log("=====> 잡플래닛 크롤링 실패");
    throw error;
  }
}
