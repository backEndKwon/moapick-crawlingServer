import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./utils/swagger";
import { HttpExceptionFilter } from "./common/exceptions/http-Exception.filter";
import { ValidationPipe } from "@nestjs/common";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());
  
  const port = 3030;
  app.enableCors({
    origin: "*",
    credentials: true,
  });

  setupSwagger(app);

  await app.listen(port);
}

bootstrap();
