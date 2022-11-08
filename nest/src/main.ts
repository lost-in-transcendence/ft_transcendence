import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      origin: ['http://localhost:' + env.FRONT_PORT, ],
      credentials: true,
    }
    );
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  await app.listen(env.BACK_PORT);
}
bootstrap();
