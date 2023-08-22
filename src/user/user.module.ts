import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersEntity } from 'src/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyEntity } from 'src/entity/company.entity';
import { Repository } from 'typeorm';
import { ApplicantEntity } from 'src/entity/applicant.entity';
import { AuthService } from 'src/auth/auth.service';
import { ApplicantModule } from 'src/applicant/applicant.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, CompanyEntity, ApplicantEntity]),
    AuthModule,
    JwtModule,
  ],
  controllers: [UserController],
  providers: [UserService, Repository],
  exports: [UserService],
})
export class UserModule {}
