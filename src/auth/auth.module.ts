import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersEntity } from "src/entity/user.entity";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { CompanyEntity } from "src/entity/company.entity";
import { CompanyService } from "src/company/company.service";
import { JwtStrategy } from "../common/strategy/jwt-service.strategy";
@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([UsersEntity, CompanyEntity]),
    PassportModule.register({ defaultStrategy: "jwt" }), //jwt 전략 사용
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>("JWT_SECRETKEY"),
          expiresIn: configService.get<string>("JWT_EXPIRATION_IN_TRIAL"),//첫 사용자 자동 trial기간 설정
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, UserService, CompanyService, JwtModule, JwtStrategy], // Add UserService here
  exports: [AuthService],
})
export class AuthModule {}
