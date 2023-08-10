import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './utils/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const post = 3030;
  // const post = 5000 //공용(추후 환경변수로 대체)
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  setupSwagger(app);
  await app.listen(post);
}
bootstrap();
