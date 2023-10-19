import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeORMConfig } from "./configs/typeorm.config";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";
import { CompanyModule } from "./company/company.modules";
import { APP_FILTER } from "@nestjs/core";
import { HttpExceptionFilter } from "./auth/exceptions/http-Exception.filter";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule을 import
      useFactory: (configService: ConfigService) =>
        typeORMConfig(configService), // ConfigService 주입하여 typeORMConfig 함수 호출
      inject: [ConfigService], // ConfigService 주입
    }),
    UserModule,
    AuthModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
