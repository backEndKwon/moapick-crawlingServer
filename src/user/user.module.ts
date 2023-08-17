import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersEntity } from 'src/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyEntity } from 'src/entity/company.entity';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity, CompanyEntity]), AuthModule],
  controllers: [UserController],
  providers: [UserService, Repository],
})
export class UserModule {}
