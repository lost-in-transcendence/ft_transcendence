import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      origin: ['http://localhost:' + env.FRONT_PORT, ],
    }
  );
  await app.listen(env.BACK_PORT);
}
bootstrap();
