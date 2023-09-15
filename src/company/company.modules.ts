import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from 'src/entity/company.entity';
import { CompanyService } from './company.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity]),
  ],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
