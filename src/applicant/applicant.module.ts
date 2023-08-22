import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApplicantService } from './applicant.service';
import { ApplicantController } from './applicant.controller';
import { ApplicantEntity } from './entities/applicant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [HttpModule,TypeOrmModule.forFeature([ApplicantEntity])],
  providers: [ApplicantService],
  controllers: [ApplicantController],
})
export class ApplicantModule {}
