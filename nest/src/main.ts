import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SocketIOAdapter } from './websocket-server/adapter/socket-io.adapter';

async function bootstrap()
{
	const app = await NestFactory.create(AppModule);
	app.enableCors(
		{
      		origin: [`${env.FRONT_URL}`, ],
      		credentials: true,
		}
	);
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.use(cookieParser());
	app.useWebSocketAdapter(new SocketIOAdapter(app));
	await app.listen(env.BACK_PORT);
}
bootstrap();
