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
import { wantedCrawling } from "src/crawling/wantedCrawling";
import { wantedLoginCheck } from "src/crawling/checkWantedLogin";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  // # 사용자 추가정보 및 회사정보 생성 및 저장
  async addCompanyInfo(body: addCompanyInfoDto) {
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
      const createCompanyInfo = this.companyRepository.create({
        companyName,
        user_id: existUserId,
        eid: eid,
        grade: "trial", //tiral은 2주 무료
      });

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

  // --크롤링-- //
  // 설명:크롤링 관련 controller만들기 애매하고 크롤링도 user의 행동 user에 넣어놓음
  //[크롤링] 원티드 지원자
  async crawlingWanted(id: string, password: string) {
    try {
      const result = await wantedCrawling(id, password);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // [크롤링] 원티드 로그인 체크
  async checkWantedLogin(ID: string, PW: string) {
    try {
      const result = await wantedLoginCheck(ID, PW);
      return { message: "로그인이 확인되었습니다.", result };
    } catch (error) {
      throw error;
    }
  }
}
