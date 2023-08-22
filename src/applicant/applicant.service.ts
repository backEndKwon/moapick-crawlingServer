import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ApplicantEntity } from './entities/applicant.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ApplicantService {
  constructor(
    @InjectRepository(ApplicantEntity)
    private readonly applicantRepository: Repository<ApplicantEntity>,
  ) {}
  private apiUrl = 'https://oapi.greetinghr.com/openapi';
  private apiKey =
    '08dacc9b6d4f3ad04f3e31348e1627c69d8883df5eaee04ed3b78a2d8620f65c';
  // ① 스크래핑 정보 -> DB 저장(openingId까지 매칭후 저장)
  async saveApplicant(body: any) {
    //해당body값의 공고명으로 openingId찾는 로직
    if (!body.name) {
      throw new BadRequestException('이름을 입력해주세요');
    }
    if (!body.email) {
      throw new BadRequestException('이메일을 입력해주세요');
    }
    //전화번호는 없어도 됨

    const page = 0;
    const pageSize = 100;
    let queryParams = `?page=${page}&pageSize=${pageSize}`;
    try {
      const response = await axios.get(
        `${this.apiUrl}/published-openings${queryParams}`,
        {
          headers: {
            'X-Greeting-OpenAPI': this.apiKey,
          },
        },
      );

      const responseData = response.data.data.datas;
      const title = body.title;
      const openingId = await this.findOpeningById(responseData, title);

      const applicantData = {
        openingId: openingId,
        name: body.name, // 필수 //from 민석님
        email: body.email, //from 민석님
        phone: body.phone, //from 민석님
        referer: '원티드', //선택
        optionalTermsAgree: false,
        fileUrl: body.fileUrl, // 필수 //from 민석님
        filename: body.filename, // 필수 //from 민석님
        fileToken: null,
        docName: '이력서', // 필수
        application_date: body.application_date, //from 민석님
        title: body.title, //from 민석님
      };

      const createData = await this.applicantRepository.create(applicantData);
      await this.applicantRepository.save(createData);
      console.log('service 저장완료');
    } catch (error) {
      console.log('error발생', error);
      throw new BadRequestException('공고를 불러오는데 실패했습니다.');
    }
  }

  // ② 지원자 정보 그리팅 등록
  async register(queryEmails: string[]) {
    // console.log("===========> ~ emails:", queryEmails)
    try {
      await Promise.all(queryEmails.map(async (email) => {
      // for (const email of queryEmails) {
        const existUser = await this.findUser(email);
        if(!existUser) {
          throw new NotFoundException(`${email}계정은 존재하지 않습니다.`);
        }
        // 지원자 openingId 찾기
        const openingId = existUser.openingId;
        
        // 저장되는 DATA 빌드
        const applicantData = {
          openingId: openingId,
          name: existUser.name,
          email: existUser.email,
          phone: existUser.phone,
          referer: existUser.referer,
          optionalTermsAgree: existUser.optionalTermsAgree,
          documents: [
            {
              fileUrl: existUser.fileUrl,
              filename: existUser.filename,
              fileToken: existUser.fileToken,
              docName: existUser.docName,
            },
          ],
          questionnaires: [],
          additionalApplicantInfo: null,
        };
        
        await this.isUploaded(email); // isUploaded? true
        await this.applicantRequest(applicantData);
      }));
    } catch (error) {
      console.log(error)
      throw new BadRequestException(error,'지원자 등록에 실패했습니다.');
    }
  }

  // * 사용자 찾기
  async findUser(email: string): Promise<ApplicantEntity> {
    const existUser = await this.applicantRepository.findOne({
      where: { email },
    });
    if (!existUser) {
      throw new UnauthorizedException('등록되지 않은 사용자입니다.');
    }
    return existUser;
  }
  async isUploaded(email: string): Promise<void> {
    const existUser = await this.findUser(email);
    existUser.isUploaded == true;
    await this.applicantRepository.save(existUser);
  }

  // * openingId 찾기(From greeting)
  async findOpeningById(responseData: any, title: string) {
    const openingInfo = await responseData.find((data) => data.title === title);
    return openingInfo.id;
  }

  // * [그리팅 API 요청]지원자 등록 요청
  async applicantRequest(applicantData: any): Promise<AxiosResponse> {
    const existUser = await this.findUser(applicantData.email);
    if (!existUser) {
      throw new NotFoundException('등록되지 않은 사용자입니다.');
    }
    existUser.isUploaded == true;

    await this.applicantRepository.save(existUser);

    return axios.post(`${this.apiUrl}/applicant`, applicantData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Greeting-OpenAPI': this.apiKey,
      },
    });
  }

  // // ⑩ 지원자 token방식 파일 업로드 요청 // 추후 오픈
  // async fileUploadRequest(
  //   openingId: number,
  //   fileName: string,
  // ): Promise<AxiosResponse> {
  //   const requestData = {
  //     openingId,
  //     fileName,
  //   };

  //   return axios.post(`${this.apiUrl}/file-upload`, requestData, {
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-Greeting-OpenAPI': this.apiKey,
  //     },
  //   });
  // }
}
