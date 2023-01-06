import { Logger, ParseEnumPipe, ParseUUIDPipe, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server, Namespace } from 'socket.io';
import { env } from "process";
import { StatusType, GameStatusType, User } from "@prisma/client";

import { UsersService } from "src/users/users.service";
import { CustomWsFilter } from "./filters";
import { UserInterceptor } from "./interceptor";
import { WsValidationPipe } from "./pipes";
import { GetUserWs } from "src/users/decorator/get-user-ws";
import * as events from 'shared/constants/users'
import { type } from "os";
import { SocketStore } from "./socket-store";
import { IsNotEmpty, IsUUID } from "class-validator";

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`})
export class MainGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new Logger(MainGateway.name);
	private readonly socketStore = new SocketStore();

	constructor(private readonly userService: UsersService) {}

	@WebSocketServer()
	server: Server;

	afterInit(server: Server)
	{
		this.logger.log('Main Gateway initialized');
	}

	handleConnection(client: Socket)
	{
		this.logger.log(`Client ${client.id} connected to Main websocket Gateway`);
		this.server.to(client.id).emit('handshake', client.data.user);
		this.socketStore.setUserSockets(client.data.user.id, client);
		// this.logger.debug(this.socketStore.getUserSockets(client.data.user.id).map((v) => {
		// 	return v.id;
		// }))
	}

	handleDisconnect(client: Socket)
	{
		this.logger.log(`Client ${client.id} disconnected from Main websocket Gateway`);
		this.logger.debug(`socket id : ${client.id}`);
		this.socketStore.removeUserSocket(client.data.user.id, client);
		if (!this.socketStore.getUserSockets(client.data.user.id))
		{
			this.userService.updateUser({where: {id: client.data.user.id}, data: {status: StatusType.OFFLINE, gameStatus: GameStatusType.NONE}});
		}
		// this.logger.debug("handleDisconnect", this.socketStore.getUserSockets(client.data.user.id).map((v) => {
		// 	return v.id;
		// }))
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

	@SubscribeMessage('changeGameStatus')
	async changeGameStatus(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('gameStatus', new ParseEnumPipe(GameStatusType)) gameStatus: GameStatusType)
	{
		const updatedUser = await this.userService.updateUser({
			where: { id: user.id },
			data: { gameStatus }
		});
		// this.server.to(client.id).emit(events.UPDATE_USER, { gameStatus: updatedUser.gameStatus });
	}

	@SubscribeMessage('test')
	async testfunct()
	{
		this.server.of('/chat').emit('notify', {status: 'this is a test'});
	}

	@SubscribeMessage('invite')
	async invite(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody() body: any)
	{
		const {gameId, invitedUser} = body;
		const sockets = this.socketStore.getUserSockets(invitedUser);
		if (!sockets)
		{
			this.server.to(client.id).emit('userOffline');
			return;
		}
		sockets.forEach((v) =>
		{
			// console.log("in here");
			this.server.to(v.id).emit('notification', {type: 'invite', inviter: user.userName, inviterId: user.id, gameId});
		})
		// find uid corresponding socket(s)
		// send a "notification" message to socket(s)
		// payload should have type: invite, inviter: user.userName
	}

	@SubscribeMessage('declineInvite')
	async declineInvite(@ConnectedSocket() client: Socket, @MessageBody('inviterId', new ParseUUIDPipe) inviterId: string)
	{
		console.log('declineInvite');
		const sockets = this.socketStore.getUserSockets(inviterId);
		sockets.forEach((v) =>
		{
			this.server.to(v.id).emit('invitationDeclined');
		})
	}
}


export class InviteNotificationDto
{
	@IsUUID()
	@IsNotEmpty()
	gameId: string;

	@IsUUID()
	@IsNotEmpty()
	invitedUser: string;
}