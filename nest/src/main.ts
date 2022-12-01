import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { env } from 'process';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { SocketIOAdapter } from './websocket-server/socket-io.adapter';

async function bootstrap()
{
	const app = await NestFactory.create(AppModule);
	app.enableCors(
		{
      		// origin: [`${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`, ],
			origin: 'http://localhost:3000',
			methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      		credentials: true,
		}
	);
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.use(cookieParser());
	app.useWebSocketAdapter(new SocketIOAdapter(app));
	await app.listen(env.BACK_PORT);
}
bootstrap();
