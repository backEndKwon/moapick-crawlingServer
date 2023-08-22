import { Controller, Post, Query, Get, Body, Res, Req } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { ApplicantEntity } from './entities/applicant.entity';

@Controller('applicant')
export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}
  
  //-----------------------------------------------//
  // ① 지원자 정보 DB 저장(openingId 포함)
  @Post('/save')
  async saveApplicant(@Body() body: ApplicantEntity) {
    await this.applicantService.saveApplicant(body);
    return 'controller 저장완료';
  }

  // ② 지원자 정보 그리팅 등록
  @Post('/register') //추후 authGuard 추가예정
  async register(@Query('email') queryEmails: string[] ) {
    await this.applicantService.register(queryEmails);
    return '지원자 등록 성공';
  }

  //-----------------------------------------------//
  // //단일(직접 값 입력) 발송
  // @Post('register')
  // async register() {
  //   try {
  //     // 지원자 파일 업로드 요청
  //     const openingId = 84400;
  //     // const fileName = '이력서123.pdf';

  //     // const fileUploadResponse = await this.applicantService.fileUploadRequest(
  //     //   openingId,
  //     //   fileName,
  //     // );
  //     // const token = fileUploadResponse.data.data.fileToken
  //     // console.log("===========> ~ token:", token)

  //     // 지원자 등록 요청
  //     const applicantData = {
  //       openingId: openingId,
  //       name: '르탄이',
  //       email: 'sparta@gamil.com',
  //       phone: '01099995555',
  //       referer: '원티드',
  //       optionalTermsAgree: true,
  //       documents: [{
  //         fileUrl:
  //           'https://blog.kakaocdn.net/dn/C8kUo/btqEjCGNiq2/oENoAsTJvcqtdgykO7xqIk/SQLD_34_%EA%B8%B0%EC%B6%9C%EB%AC%B8%EC%A0%9C.pdf?attach=1&knm=tfile.pdf',//이런식의 url
  //         filename: 'SQLD 요약정리 2021.pdf',//확장자명까지
  //         fileToken: null,//토큰 없을땐 null
  //         // fileUrl: null,
  //         // filename: null,
  //         // fileToken: fileUploadResponse.data.data.fileToken,
  //         docName: '토큰없이 보내기',
  //       },],
  //       questionnaires:[],
  //       additionalApplicantInfo:null
  //     };
  //     const applicantResponse = await this.applicantService.applicantRequest(
  //       applicantData,
  //     );
  //     return "지원자 등록 성공"
  //   } catch (error) {
  //     console.log('===========> 지원자 등록 실패:', error);
  //   }
  // }


  // @Get('findOpeningId')
  // async findOpeningId() {
  //   await this.applicantService.findOpeningId();
  //   return "openingId 조회 성공"
  // }
}
