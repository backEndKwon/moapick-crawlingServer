import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./utils/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3030;
  app.enableCors({
    origin: "*",
    credentials: true,
  });
  setupSwagger(app);
  await app.listen(port);
}
bootstrap();
