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
}
