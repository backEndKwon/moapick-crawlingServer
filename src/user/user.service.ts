import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UsersEntity } from "src/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignupDto, addCompanyInfoDto } from "src/dtos/user.dto";
import { CompanyEntity } from "src/entity/company.entity";
import { wantedCrawling } from "src/crawling/wanted/wantedCrawling";
import { wantedLoginCheck } from "src/crawling/wanted/checkWantedLogin";
import { RocketPunchLoginCheck } from "src/crawling/rocketPunch/checkRocketPunchLogin";
import { CrawlingRocketPunch } from "src/crawling/rocketPunch/rocketPunchCrawling";
import { programmersLoginCheck } from "src/crawling/programmers/checkProgrammersLogin";
import { programmersCrawling } from "src/crawling/programmers/programmersCrawling";
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  // # 사용자 추가정보 및 회사정보 생성 및 저장
  async addCompanyInfo(body: addCompanyInfoDto): Promise<void> {
    try {
      const { email, companyName, eid, phone } = body;
      if (!email) {
        throw new BadRequestException("이메일을 입력해주세요.");
      }
      if (!phone) {
        throw new BadRequestException("전화번호를 입력해주세요.");
      }
      if (!companyName) {
        throw new BadRequestException("회사명을 입력해주세요.");
      }
      if (!eid) {
        throw new BadRequestException("사업자번호를 입력해주세요.");
      }
      const existUser = await this.findByEmail(email);
      if (!existUser) {
        throw new NotFoundException("존재하지 않는 사용자입니다.");
      }
      // ⓐ 전화번호는 user Table에 저장
      existUser.phone = phone;
      await this.userRepository.save(existUser);

      // ⓑ user Table 의 user_id와 eid, grade를 company Table에 저장하면서 새로운 행 생성
      const existUserId = existUser.user_id;
      const startDate = existUser.createdAt;
      const startDatea = new Date(startDate); // 예시로 주어진 시작 날짜
      console.log("===========> ~ startDatea:", startDatea);

      const expirationDateTimestamp =
        startDatea.getTime() + 14 * 24 * 60 * 60 * 1000; // 현재 시간에서 14일 후의 타임스탬프
      const expirationDate = new Date(expirationDateTimestamp).toISOString();

      const createCompanyInfo = this.companyRepository.create({
        companyName,
        user_id: existUserId,
        eid: eid,
        plan: "Trial", //tiral은 2주 무료
        isPaid: false,
        paymentStartDate: startDate.toISOString(),
        paymentExpirationDate: expirationDate,
      });
      console.log("===========> ~ createCompanyInfo:", createCompanyInfo);

      await this.companyRepository.save(createCompanyInfo);
      console.log("추가정보 저장 완료");
    } catch (err) {
      console.log("추가정보 저장 실패", err);
    }
  }
  catch(err) {
    console.log("사용자 추가정보 생성 및 저장 실패", err);
  }

  // # 사용자 및 회사정보 조회
  async getMypage(decodedToken: any) {
    console.log("user.service===========> ~ decodedToken:", decodedToken);
    try {
      const email = decodedToken.email;
      const userInfo = await this.findByEmail(email);
      if (!userInfo) {
        throw new NotFoundException("존재하지 않는 사용자입니다.");
      }
      const userId = userInfo.user_id;
      const companyInfo = await this.findCompanyInfo(userId);

      if (!companyInfo) {
        throw new NotFoundException("존재하지 않는 회사정보입니다.");
      }

      //민석님 요청사항 : 따로 빼서 보내주기
      const user_name = userInfo.name;
      const user_email = userInfo.email;
      const user_userId = userInfo.user_id;
      const company = companyInfo[0];
      const result = { ...company, user_name, user_email, user_userId };
      return { message: "회사정보 조회 완료", result };
    } catch (err) {
      throw new NotFoundException("내 정보조회에 실패하였습니다.");
    }
  }

  // (로그아웃) 사용자 저장
  async saveUser(user: UsersEntity) {
    return await this.userRepository.save(user);
  }
  // (회원가입) 사용자 저장
  async saveSignUpUser(user: Partial<SignupDto>) {
    return await this.userRepository.save(user);
  }
  // (로그인) 상태 업데이트
  async updateLoginUser(email: string) {
    return await this.userRepository.update({ email }, { isLogin: true });
  }
  // (로그아웃) 상태 업데이트
  async updateLogoutUser(email: string) {
    return await this.userRepository.update({ email }, { isLogin: false });
  }

  // UserId 로 회사정보 조회
  async findCompanyInfo(userId: number) {
    return await this.companyRepository.find({ where: { user_id: userId } });
  }

  // Email로 사용자 조회
  async findByEmail(email: string) {
    const existUser = await this.userRepository.findOne({ where: { email } });
    return existUser;
  }

  /* 크롤링 */
  // info:크롤링 관련 controller만들기 애매하고 크롤링도 user의 행동 user에 넣어놓음
  // (1)-1 원티드 로그인
  async checkWantedLogin(ID: string, PW: string) {
    try {
      const result = await wantedLoginCheck(ID, PW);
      return { message: "원티드 로그인이 확인되었습니다.", result };
    } catch (error) {
      console.log("=====>원티드 로그인 실패");
      throw error;
    }
  }
  // (1)-2 원티드
  async crawlingWanted(id: string, password: string) {
    try {
      if (!id || !password) {
        throw new BadRequestException("아이디와 비밀번호를 입력해주세요.");
      }
      const result = await wantedCrawling(id, password);
      console.log("=====>원티드 크롤링 완료");
      return result;
    } catch (error) {
      console.log("=====>원티드 크롤링 실패");
      throw error;
    }
  }

  // (2)-1 로켓펀치 로그인
  async checkRocketPunchLogin(ID: string, PW: string) {
    try {
      const result = await RocketPunchLoginCheck(ID, PW);
      return { message: " 로켓펀치 로그인이 확인되었습니다.", result };
    } catch (error) {
      console.log("=====>로켓펀치 로그인 실패");
      throw error;
    }
  }

  // (2)-2 로켓펀치
  async crawlingRocketPunch(id: string, password: string) {
    try {
      if (!id || !password) {
        throw new BadRequestException("아이디와 비밀번호를 입력해주세요.");
      }
      const result = await CrawlingRocketPunch(id, password);
      console.log("=====>로켓펀치 크롤링 완료");
      return result;
    } catch (error) {
      console.log("=====>로켓펀치 크롤링 실패");
      throw error;
    }
  }

  // (3)-1 프로그래머스 로그인
  async checkProgrammersLogin(ID: string, PW: string) {
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
  async crawlingProgrammers(id: string, password: string) {
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

  // // (4)-1 잡플래닛 로그인
  // async checkJobplanetLogin(ID: string, PW: string) {
  //   try {
  //     const result = await RocketPunchLoginCheck(ID, PW);
  //     console.log("=====> 잡플래닛 로그인 완료");
  //     return { message: " 잡플래닛 로그인이 확인되었습니다.", result };
  //   } catch (error) {
  //     console.log("=====> 잡플래닛 로그인 실패");
  //     throw error;
  //   }
  // }

  // // (4)-2 잡플래닛
  // async crawlingJobplanet(id: string, password: string) {
  //   try {
  //     const result = await CrawlingJobplanet(id, password);
  //     console.log("=====> 잡플래닛 크롤링 완료");
  //     return { message: " 잡플래닛 크롤링이 확인되었습니다.", result };
  //   } catch (error) {
  //     console.log("=====> 잡플래닛 크롤링 실패");
  //     throw error;
  //   }
  // }
}
