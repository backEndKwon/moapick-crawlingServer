import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UsersEntity } from "src/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignupDto, addCompanyInfoDto } from "src/user/dtos/user.dto";
import { CompanyService } from "src/company/company.service";

/* 나인하이어는 추후 api 연동 가능여부 체크후 진행 */
import { NinehireLoginCheck } from "src/crawling/ninehire/checkNinehireLogin";
import { CrawlingNinehirePostId } from "src/crawling/ninehire/ninehirePostIdCrawling";
import { CrawlingNinehire } from "src/crawling/ninehire/ninehireCrawling";
import {
  CommonException,
  CompanyNameException,
  EidException,
  EmailException,
  ExistUserException,
  LimitCreateCompanyAccountException,
  NotExistCompanyException,
  NotExistUserException,
  PhoneNumberException,
} from "src/common/exceptions/common-Exceptioin";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private readonly companyService: CompanyService,
  ) {}

  // # 사용자 추가정보 및 회사정보 생성 및 저장
  async addCompanyInfo(body: addCompanyInfoDto): Promise<void> {
    const { email, companyName, eid, phone } = body;
    if (!email) {
      throw new EmailException();
    }
    if (!phone) {
      throw new PhoneNumberException();
    }
    /* 전화번호 유효성 검사 */
    await this.checkPhoneNumber(phone);

    if (!companyName) {
      throw new CompanyNameException();
    }
    if (!eid) {
      throw new EidException();
    }
    // /* 사업자번호 유효성 검사 */
    // const checkEid = await this.checkCorporateEidNumber(eid);
    // if (!checkEid) {
    //   throw new BadRequestException("유효하지 않은 사업자 번호 입니다.");
    // }
    const existCompany = await this.companyService.findCompanyInfoByEid(eid);
    if (existCompany) {
      throw new LimitCreateCompanyAccountException();
    }
    const existUser = await this.findByEmail(email);
    if (!existUser) {
      throw new ExistUserException();
    }

    // ⓐ 전화번호는 user Table에 저장
    existUser.phone = phone;
    await this.saveUserPhoneNumber(existUser);

    // ⓑ user Table 의 user_id와 eid, grade를 company Table에 저장하면서 새로운 행 생성
    const existUserId = existUser.user_id;
    const startDate = existUser.createdAt;
    const startDatea = new Date(startDate); // 예시로 주어진 시작 날짜

    /* 무료제공 : 2주 trial */
    const expirationDateTimestamp =
      startDatea.getTime() + 14 * 24 * 60 * 60 * 1000; // 현재 시간에서 14일 후의 타임스탬프
    const expirationDate = new Date(expirationDateTimestamp).toISOString();

    const createCompanyInfo = await this.companyService.createCompanyInfo(
      companyName,
      existUserId,
      eid,
      startDate,
      expirationDate,
    );
    await this.companyService.saveCompanyInfo(createCompanyInfo);
    console.log(
      `${companyName}회사에서 "${email}"계정으로 가입완료하였습니다.`,
    );
    console.log(`추가정보 저장 완료`);
  }

  // # 사용자 및 회사정보 조회
  async getMypage(decodedToken: any) {
    try {
      const email = decodedToken.email;
      const userInfo = await this.findByEmail(email);
      if (!userInfo) {
        throw new NotExistUserException();
      }
      const userId = userInfo.user_id;
      const companyInfo = await this.companyService.findCompanyInfoByUserId(
        userId,
      );
      if (!companyInfo) {
        throw new NotExistCompanyException();
      }

      //프론트 요청사항 : 따로 빼서 보내주기
      const user_name = userInfo.name;
      const user_email = userInfo.email;
      const user_userId = userInfo.user_id;
      const company = companyInfo[0];
      const result = { ...company, user_name, user_email, user_userId };
      return { message: "회사정보 조회 완료", result };
    } catch (err) {
      throw new CommonException();
    }
  }

  /* 사업자등록번호 유효성 검사 */
  async checkCorporateEidNumber(eid: string) {
    var numberMap = eid
      .replace(/-/gi, "")
      .split("")
      .map(function (d) {
        return parseInt(d, 10);
      });

    if (numberMap.length == 10) {
      var keyArr = [1, 3, 7, 1, 3, 7, 1, 3, 5];
      var chk = 0;

      keyArr.forEach(function (d: number, i: number) {
        chk += d * numberMap[i];
      });

      chk += parseInt(
        ((keyArr[8] * numberMap[8]) / 10) as unknown as string,
        10,
      );
      const num = Number(numberMap[9]);
      return Math.floor(num) === (10 - (chk % 10)) % 10;
    }

    return false;
  }

  /* 전화번호 11자리 유효성 검사(프론트에서 한번 걸러줌) */
  async checkPhoneNumber(phone: string) {
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone)) {
      throw new PhoneNumberException();
    }
  }

  /* 추후 Repository로 분리 */
  // (로그아웃) 사용자 저장
  async saveUser(user: UsersEntity) {
    return await this.userRepository.save(user);
  }
  // (회원가입) 사용자 저장
  async saveSignUpUser(user: Partial<SignupDto>) {
    return await this.userRepository.save(user);
  }
  /* addCompanyInfo에서 사용자 휴대폰번호만 user 테이블에 따로 저장 */
  async saveUserPhoneNumber(existUser: UsersEntity) {
    return await this.userRepository.save(existUser);
  }
  // (로그인) 상태 업데이트
  async updateLoginUser(email: string) {
    return await this.userRepository.update({ email }, { isLogin: true });
  }
  // (로그아웃) 상태 업데이트
  async updateLogoutUser(email: string) {
    return await this.userRepository.update({ email }, { isLogin: false });
  }
  // Email로 사용자 조회
  async findByEmail(email: string) {
    const existUser = await this.userRepository.findOne({ where: { email } });
    return existUser;
  }
}

// // 나인하이어 로그인
// async checkNinehireLogin(ID: string, PW: string) {
//   try {
//     const result = await NinehireLoginCheck(ID, PW);
//     console.log("=====> 나인하이어 로그인 확인");
//     return { message: " 나인하이어 로그인이 확인되었습니다.", result };
//   } catch (error) {
//     console.log("=====> 나인하이어 로그인 실패");
//     throw error;
//   }
// }
// async crawlingNinehirePostId(id: string, password: string) {
//   try {
//     const result = await CrawlingNinehirePostId(id, password);
//     console.log("=====> 나인하이어 포스팅 아이디 확인");
//     return { message: " 나인하이어 포스팅 아이디  확인되었습니다.", result };
//   } catch (error) {
//     console.log("=====> 나인하이어 포스팅 아이디 실패");
//     throw error;
//   }
// }

// async crawlingNinehire(id: string, password: string) {
//   try {
//     const result = await CrawlingNinehire(id, password);
//     console.log("=====> 나인하이어 크롤링 확인");
//     return { message: " 나인하이어 크롤링이 확인되었습니다.", result };
//   } catch (error) {
//     console.log("=====> 나인하이어 크롤링 실패");
//     throw error;
//   }
// }
