import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersEntity } from "src/entity/user.entity";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
// import { JwtServiceStrategy } from './strategy/jwt-service.strategy';
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { CompanyEntity } from "src/entity/company.entity";
import { CompanyService } from "src/company/company.service";
import { JwtStrategy } from "./strategy/jwt-service.strategy";
// import { LocalServiceStrategy } from './guards/local-service.guard';
@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([UsersEntity, CompanyEntity]),
    PassportModule.register({ defaultStrategy: "jwt" }), //세션대신 토큰기반 인증을 사용하기 위한 모듈
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>("JWT_SECRETKEY"),
          expiresIn: configService.get<string>("JWT_EXPIRATION_IN_TRIAL"),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, UserService, CompanyService, JwtModule, JwtStrategy], // Add UserService here
  exports: [AuthService],
})
export class AuthModule {}
