import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtServiceStrategy } from './strategy/jwt-service.strategy';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { CompanyEntity } from 'src/entity/company.entity';
import { Repository } from 'typeorm';
@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([UsersEntity, CompanyEntity]),
    PassportModule.register({ session: false }), //세션대신 토큰기반 인증을 사용하기 위한 모듈
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtServiceStrategy, UserService,Repository],
  exports: [AuthService],
})
export class AuthModule {}
