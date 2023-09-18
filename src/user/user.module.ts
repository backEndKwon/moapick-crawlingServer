import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UsersEntity } from 'src/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CompanyEntity } from 'src/entity/company.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/strategy/jwt-service.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersEntity, CompanyEntity]),
    AuthModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          global: true,
          secret: configService.get<string>('JWT_SECRETKEY'),
          expiresIn: configService.get<string>('JWT_EXPIRATION_IN_TRIAL'),
        };
      },
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }), // PassportModule을 가져옴
  ],
  controllers: [UserController],
  providers: [UserService, JwtModule, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
