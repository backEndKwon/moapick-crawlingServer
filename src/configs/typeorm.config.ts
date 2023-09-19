import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const typeORMConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: "postgres",
    host: configService.get<string>("DB_HOST", "localhost"),
    port: configService.get<number>("DB_PORT"),
    username: configService.get<string>("DB_USERNAME"),
    password: configService.get<string>("DB_PASSWORD"),
    database: configService.get<string>("DB_DATABASE"),
    entities: [__dirname + "/../**/*.entity.{js,ts}"],
    synchronize: configService.get<boolean>("DB_SYNCHRONIZE"),
    extra: {
      timezone: "+09:00",
    },
  };
};
