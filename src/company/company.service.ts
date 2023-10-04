import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanyEntity } from "src/entity/company.entity";

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  // User_id로 회사정보 조회
  async findCompanyInfoByUserId(user_id: number) {
    return await this.companyRepository.findOne({ where: { user_id } });
  }

  // eid로 회사정보 조회
  async findCompanyInfoByEid(eid: string) {
    return await this.companyRepository.findOne({ where: { eid } });
  }
  // 회사정보 make(addCompanyInfo)
  async createCompanyInfo(
    companyName: string,
    existUserId: number,
    eid: string,
    startDate: Date,
    expirationDate: string,
  ) {
    return await this.companyRepository.create({
      companyName,
      user_id: existUserId,
      eid: eid,
      plan: "Trial", //tiral은 2주 무료
      isPaid: false,
      paymentStartDate: startDate.toISOString(),
      paymentExpirationDate: expirationDate,
    });
  }
  // 회사정보 save(addCompanyInfo)
  async saveCompanyInfo(companyInfo) {
    return await this.companyRepository.save(companyInfo);
  }
}
