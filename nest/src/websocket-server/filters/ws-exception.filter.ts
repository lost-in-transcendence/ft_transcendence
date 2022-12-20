import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger, WsExceptionFilter } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import {Socket} from 'socket.io';
import { emit } from "process";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Prisma } from "@prisma/client";
import { ValidationError } from "class-validator";

@Catch()
export class CustomWsFilter extends BaseWsExceptionFilter
{
	private readonly logger = new Logger(CustomWsFilter.name);

	constructor()
	{
		super();
	}
	catch(exception: unknown, host: ArgumentsHost)
	{
		const ctx = host.switchToWs()
		const client: Socket = ctx.getClient();

		if (exception instanceof HttpException)
			return (client.emit('exception', {status: exception.getStatus(), message: exception.message}));
		if (exception instanceof PrismaClientKnownRequestError)
			return (client.emit('exception', {status: exception.code, message: `${exception.name} ${exception.message}`}));
		//client.emit('exception', {status: 500, message: exception})
		super.catch(exception, host);
	}

}
