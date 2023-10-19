import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./utils/swagger";
import { HttpExceptionFilter } from "./auth/exceptions/http-Exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
