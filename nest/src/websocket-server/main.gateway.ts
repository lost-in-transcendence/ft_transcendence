import { Logger, ParseEnumPipe, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server, Namespace } from 'socket.io';
import { env } from "process";
import { StatusType, User } from "@prisma/client";

import { UsersService } from "src/users/users.service";
import { CustomWsFilter } from "./filters";
import { UserInterceptor } from "./interceptor";
import { WsValidationPipe } from "./pipes";
import { GetUserWs } from "src/users/decorator/get-user-ws";
import * as events from 'shared/constants/users'
import { type } from "os";

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`})
export class MainGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new Logger(MainGateway.name);

	constructor(private readonly userService: UsersService) {}

	@WebSocketServer()
	server: Namespace;

	afterInit(server: Server)
	{
		this.logger.log('Main Gateway initialized');
	}

	handleConnection(client: Socket, ...args: any[])
	{
		this.logger.log(`Client ${client.id} connected to Main websocket Gateway`);
	}

	handleDisconnect(client: Socket)
	{
		this.logger.log(`Client ${client.id} disconnected from Main websocket Gateway`);
	}

	@SubscribeMessage(events.CHANGE_STATUS)
	async changeStatus(@GetUserWs() user: User, @MessageBody('status', new ParseEnumPipe(StatusType)) newStatus: StatusType, @ConnectedSocket() client: Socket)
	{
		const updatedUser = await this.userService.updateUser({
			where: { id: user.id },
			data: { status: newStatus }
		});
		this.server.to(client.id).emit(events.UPDATE_USER, { status: updatedUser.status });
	}
}
