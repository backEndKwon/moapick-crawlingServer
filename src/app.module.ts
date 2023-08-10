import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersRepository } from './auth/user.repository';
// import { AuthService } from './auth/auth.service';
// import { AuthController } from './auth/auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig),UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
