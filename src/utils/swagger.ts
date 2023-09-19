import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle("Auth API Docs")
    .setDescription("[mopick] 로그인/회원가입 API 구현")
    .setVersion("1.0.0")
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api-docs", app, document);
  //swagger보는 방법 : http://localhost:3030/api-docs
};
