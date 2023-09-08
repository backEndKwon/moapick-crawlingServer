import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersEntity } from 'src/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto, addCompanyInfoDto } from 'src/dtos/user.dto';
import { ConfigService } from '@nestjs/config';
import { CompanyEntity } from 'src/entity/company.entity';
import { AuthService } from 'src/auth/auth.service';
import { Browser, chromium } from 'playwright';
import { config } from 'dotenv';
import { uploadFileDownload, uploadFilePreview } from '../lib/aws';
import * as fs from 'fs';
import * as os from 'os';
import { join } from 'path';
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
        throw new BadRequestException('이메일을 입력해주세요.');
      }
      if (!phone) {
        throw new BadRequestException('전화번호를 입력해주세요.');
      }
      if (!companyName) {
        throw new BadRequestException('회사명을 입력해주세요.');
      }
      if (!eid) {
        throw new BadRequestException('사업자번호를 입력해주세요.');
      }
      const existUser = await this.findByEmail(email);
      if (!existUser) {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }
      // ⓐ 전화번호는 user Table에 저장
      existUser.phone = phone;
      await this.userRepository.save(existUser);

      // ⓑ user Table 의 user_id와 eid, grade를 company Table에 저장하면서 새로운 행 생성
      const existUserId = existUser.user_id;
      const createCompanyInfo = this.companyRepository.create({
        companyName,
        user_id: existUserId,
        eid,
        grade: 'trial', //tiral은 2주 무료
      });

      await this.companyRepository.save(createCompanyInfo);
      console.log('추가정보 저장 완료');
    } catch (err) {
      console.log('추가정보 저장 실패', err);
    }
  }
  catch(err) {
    console.log('사용자 추가정보 생성 및 저장 실패', err);
  }

  // # 사용자 및 회사정보 조회
  async getMypage(decodedToken: any) {
    try {
      const email = decodedToken.email;
      const userInfo = await this.findByEmail(email);
      if (!userInfo) {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }
      const userId = userInfo.user_id;
      const companyInfo = await this.findCompanyInfo(userId);
      if (!companyInfo) {
        throw new NotFoundException('존재하지 않는 회사정보입니다.');
      }
      return { userInfo, companyInfo };
    } catch (err) {
      console.log('사용자 정보조회 실패', err);
    }
  }

  async findCompanyInfo(userId: number) {
    return await this.companyRepository.find({ where: { user_id: userId } });
  }

  // ## Email로 사용자 조회(회원가입)
  async findByEmail(email: string) {
    const existUser = await this.userRepository.findOne({ where: { email } });
    return existUser;
  }

  //---

  //로그인
  async login(ID, PW) {
    const buttonSelector = {
      emailInput: "input[name='email']",
      passwordInput: "input[name='password']",
      submitButton: 'button[type="submit"]',
    };
    const browser: Browser = await chromium.launch({
      headless: true,
    });
    const userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36';
    const context = await browser.newContext({ userAgent });
    context.setDefaultNavigationTimeout(0);
    context.setDefaultTimeout(0);

    const page = await context.newPage();
    try {
      await page.goto(
        'https://id.wanted.jobs/login?before_url=https%3A%2F%2Fwww.wanted.co.kr%2Fdashboard%2Fuser%2Fcheck&redirect_url=https%3A%2F%2Fwww.wanted.co.kr%2Fapi%2Fchaos%2Fauths%2Fv1%2Fcallback%2Fset-token&client_id=3cxYxwiZG2Hys8DvQjwJzxMm&service=dashboard&amp_device_id=undefined',
      );

      await (await page.waitForSelector(buttonSelector.emailInput)).type(ID);
      await (await page.waitForSelector(buttonSelector.submitButton)).click();

      await (await page.waitForSelector(buttonSelector.passwordInput)).type(PW);
      await (await page.waitForSelector(buttonSelector.submitButton)).click();
      console.log('로그인 성공');

      await page.waitForNavigation();
      return [page, browser, true];
    } catch (error) {
      console.log(error);
      return [page, browser, false];
    }
  }

  //채용중인 공고페이지로 이동
  async navigateJobPostings(page) {
    await page.goto(
      'https://www.wanted.co.kr/dashboard/recruitment?order=id&status=active',
    );
  }

  /**채용공고 가져오기*/
  async getJobPostings(page) {
    console.log('채용공고 가져오는 중');
    await page.waitForSelector(
      "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']",
    );
    const elements = await page.$$(
      "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']",
    );

    let applyPostId = [];
    for (let element of elements) {
      const text = await element.$eval(
        'span.gtNgFZ span',
        (node) => node.innerText,
      );
      if (parseInt(text, 10) > 0) {
        const href = await element.evaluate((node) =>
          node.getAttribute('data-position-id'),
        );
        applyPostId.push(href);
      }
    }
    console.log('채용공고 가져오기 완료');
    return applyPostId;
  }

  /**지원자카드 Id 가져오기*/
  async getUserCardsId(page, postId) {
    const applyUserInfo = await page.evaluate(
      (postId) => {
        const baseUrl = location.href.substring(
          0,
          location.href.indexOf('.kr') + 3,
        );

        const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1?column_index=send&position_id=${postId}&is_reject=false`;
        return fetch(newUrl)
          .then((res) => res.json())
          .then((data) => data.data);
      },
      [postId],
    );
    const userCardsId = applyUserInfo
      .filter((user) => user.cancel_time === null)
      .filter((user) => user.matchup_column_index === null)
      .map((user) => user.id);
    return userCardsId;
  }
  async downloadResumes(page, resumes) {
    let downloadUrls = [];
    let previewUrls = [];
    let fileNames = [];
    for (let resume of resumes.data) {
      const { file_name } = resume;
      await (
        await page.waitForSelector(`span:has-text('${file_name}')`)
      ).click();
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button:has-text("다운로드")'),
      ]);

      const fileName = await download.suggestedFilename();
      fileNames.push(fileName);
      const path = `${fileName}`;
      await download.saveAs(path);

      const downloadUrl = await uploadFileDownload(path);
      const previewUrl = await uploadFilePreview(path);

      downloadUrls.push(downloadUrl);
      previewUrls.push(previewUrl);
      try {
        fs.unlinkSync(path);
      } catch (error) {
        console.log(error);
      }
    }
    return [downloadUrls, previewUrls, fileNames];
  }
  //지원자 이력서 다운로드 및 정보 가져오기
  async saveUserResume(page, postId) {
    const url = `https://www.wanted.co.kr/dashboard/recruitment/${postId}?application=is_exclude_reject`;
    await page.goto(url);

    // Get user cards
    const userCardsIds = await this.getUserCardsId(page, postId);

    let allUserInfo = [];
    for (let userCardId of userCardsIds) {
      const url = `https://www.wanted.co.kr/dashboard/recruitment/${postId}?application=is_exclude_reject&application_detail=${userCardId}`;
      await page.goto(url);

      let userInfo = {};
      //user데이터
      const data = await page.evaluate(async (userCardId) => {
        const baseUrl = location.href.substring(
          0,
          location.href.indexOf('.kr') + 3,
        );

        const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1/${userCardId}`;
        const res = await fetch(newUrl);
        const data = await res.json();
        return data;
      }, userCardId);
      //이력서 이름
      const resumes = await page.evaluate(async (userCardId) => {
        const baseUrl = location.href.substring(
          0,
          location.href.indexOf('.kr') + 3,
        );

        const newUrl = `${baseUrl}/api/dashboard/chaos/resumes/v1/apply/${userCardId}`;
        const res = await fetch(newUrl);
        const data = await res.json();
        return data;
      }, userCardId);

      console.log(
        '🚀 ~ file: wantedCrawling.js:141 ~ resume ~ resume:',
        resumes,
      );

      const { name, email, mobile } = data.data.user;
      userInfo['name'] = name;
      userInfo['email'] = email;
      userInfo['mobile'] = mobile;
      userInfo['position'] = data.data.job.position;
      userInfo['chk_time'] = data.data.chk_time;

      const [downloadUrls, previewUrls, fileNames] = await this.downloadResumes(
        page,
        resumes,
      );

      userInfo['file_name'] = fileNames;
      userInfo['filePath'] = downloadUrls;
      userInfo['previewPath'] = previewUrls;
      allUserInfo.push(userInfo);
    }

    return allUserInfo;
  }

  async wantedCrawling(ID, PW) {
    console.log("===========> ~ PW:", PW)
    console.log("===========> ~ ID:", ID)
    // Log in

    const [page, browser, isSuccess] = await this.login(ID, PW);
    if (!isSuccess) {
      console.error('로그인에 실패했습니다.');
      return;
    }

    await this.navigateJobPostings(page);

    const applyPostIds = await this.getJobPostings(page);
    console.log("===========> ~ applyPostIds:", applyPostIds)

    let allUserInfo = [];
    
    for (let postId of applyPostIds) {
      const userInfoByJobPosting = await this.saveUserResume(
        page,
        postId,
        );
        
        allUserInfo.push(userInfoByJobPosting);
      }
      console.log("===========> ~ allUserInfo:", allUserInfo)

        // await browser.close();
        return allUserInfo;
  }
}
