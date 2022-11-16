import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap()
{
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      origin: ['http://localhost:' + env.FRONT_PORT, ],
      credentials: true,
    }
    );
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.use(cookieParser());
  await app.listen(env.BACK_PORT);
}
bootstrap();
