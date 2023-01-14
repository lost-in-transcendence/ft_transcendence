import { Logger, ParseEnumPipe, ParseUUIDPipe, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Socket, Server, Namespace } from 'socket.io';
import { env } from "process";
import { StatusType, GameStatusType, User, RoleType, PlayStats } from "@prisma/client";

import { UsersService } from "src/users/users.service";
import { CustomWsFilter } from "./filters";
import { UserInterceptor } from "./interceptor";
import { WsValidationPipe } from "./pipes";
import { GetUserWs } from "src/users/decorator/get-user-ws";
import * as events from 'shared/constants/users'
import * as chatEvents from 'shared/constants/chat'
import { type } from "os";
import { SocketStore } from "./socket-store";
import { IsNotEmpty, IsUUID } from "class-validator";
import { ChannelsService } from "src/chat/channels/channels.service";
import { PlayStatsService } from "src/playstats/playstats-service";

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}` })
export class MainGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new Logger(MainGateway.name);
	private readonly socketStore = new SocketStore();
	private nextRanking: Date;
	private rankInterval: number = 1000 * 60;

	constructor(private readonly userService: UsersService, private readonly playStatsService: PlayStatsService, private readonly channelService: ChannelsService) {}

	@WebSocketServer()
	server: Server;

	afterInit(server: Server)
	{
		this.logger.log('Main Gateway initialized');
		
		const intervalId = setInterval(async () =>
		{
			this.nextRanking = new Date(Date.now() + this.rankInterval)
			this.server.emit("nextRanking", {nextRanking: this.nextRanking});
			const usersByPoints = await this.playStatsService.findMany(
				{
					orderBy:
					{
						points: 'desc',
					},
					include:
					{
						user: true,
					}
				});
			usersByPoints.forEach((v: PlayStats, i: number) =>
			{
				const {userId} = v;
				this.playStatsService.update(
					{
						where : {userId},
						data: {rank: {set: i + 1}},
					})
			});
		}, this.rankInterval)
	}

	handleConnection(client: Socket)
	{
		this.logger.log(`Client ${client.id} connected to Main websocket Gateway`);
		this.server.to(client.id).emit('handshake', client.data.user);
		this.socketStore.setUserSockets(client.data.user.id, client);
	}

	async handleDisconnect(client: Socket)
	{
		this.logger.log(`Client ${client.id} disconnected from Main websocket Gateway`);
		this.socketStore.removeUserSocket(client.data.user.id, client);
		const ret = await this.userService.user({id: client.data.user.id});
		if (ret.isGuest)
		{
			await this.userService.deleteUser({id : ret.id});
			return;
		}
		if (this.socketStore.getUserSockets(ret.id).length === 0)
		{
			this.userService.updateUser({ where: { id:ret.id }, data: { status: StatusType.OFFLINE, gameStatus: GameStatusType.NONE } });
			this.updateUser(client, ret, {status: StatusType.OFFLINE, gameStatus: GameStatusType.NONE});
		}
		else if (ret.gameStatus === 'NONE')
		{
			this.updateUser(client, ret, {gameStatus: GameStatusType.NONE});
		}
	}

	@SubscribeMessage('nextRanking')
	async sendNextRanking(@ConnectedSocket() client: Socket)
	{
		this.server.to(client.id).emit("nextRanking", {nextRanking: this.nextRanking});
	}

	@SubscribeMessage(events.CHANGE_STATUS)
	async changeStatus(@GetUserWs() user: User, @MessageBody('status', new ParseEnumPipe(StatusType)) newStatus: StatusType, @ConnectedSocket() client: Socket)
	{
		const updatedUser = await this.userService.updateUser({
			where: { id: user.id },
			data: { status: newStatus }
		});
		this.socketStore.getUserSockets(user.id).forEach((v) =>
		{
			this.server.to(v.id).emit(events.UPDATE_USER, { status: updatedUser.status });
		})
		this.updateUser(client, user, {status: updatedUser.status});
	}

	@SubscribeMessage('changeGameStatus')
	async changeGameStatus(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('gameStatus', new ParseEnumPipe(GameStatusType)) gameStatus: GameStatusType)
	{
		this.logger.debug("changing status:", user.userName, "to:", gameStatus);
		const updatedUser = await this.userService.updateUser({
			where: { id: user.id },
			data: { gameStatus }
		});
		this.socketStore.getUserSockets(user.id).forEach((v) =>
		{
			this.server.to(v.id).emit(events.UPDATE_USER, { gameStatus: updatedUser.gameStatus });
		})
		this.updateUser(client, user, {gameStatus: updatedUser.gameStatus});
	}

	@SubscribeMessage('changeUserName')
	async changeUserName(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('userName') userName: string)
	{
		this.socketStore.getUserSockets(user.id).forEach((v) =>
		{
			this.server.to(v.id).emit(events.UPDATE_USER, { userName });
		})
		this.updateUser(client, user, {userName});
	}

	async updateUser(client: Socket, user: User, payload: any)
	{
		// get joined chans
		const joinedChans = await this.channelService.channels(
			{
				where:
				{
					AND: {members: {some: {userId: user.id}}},
					NOT: {members: {some: {userId: user.id, role: RoleType.BANNED}}},
				},
				select: {id: true}
			}
		);
		const chanIds = joinedChans.map((v) => v.id);
		//get friendlist
		const friendList = await this.userService.userSelect(
			{id: user.id},
			{friendTo: {select: {id: true}}}
		)
		const friendSockets = friendList.friendTo.map((v) =>
		{
			const sockets = this.socketStore.getUserSockets(v.id);
			if (!sockets)
				return;
			return sockets.map(v => v.id);
		})
		const flatSockets = friendSockets.flat(1);

		if (chanIds)
			this.server.of('/chat').to(chanIds).emit("updateUser", {id: user.id, data: payload})
		if (flatSockets)
			this.server.to(flatSockets).emit("updateFriend", {id: user.id, data:payload});
	}

	@SubscribeMessage(events.GET_FRIENDLIST)
	async getFriendList(@MessageBody("userId", ParseUUIDPipe) userId: string, @ConnectedSocket() client: Socket)
	{
		const friendList = await this.userService.userSelect(
			{id: userId},
			{friends: {select: {id:true, userName:true}}}
		).then( (c) => c.friends);
		this.server.to(client.id).emit(events.GET_FRIENDLIST, friendList);
	}

	@SubscribeMessage('test')
	async testfunct()
	{
		this.server.of('/chat').emit('notify', { status: 'this is a test' });
	}

	@SubscribeMessage('invite')
	async invite(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody() body: any)
	{
		const { gameId, invitedUser } = body;
		const sockets = this.socketStore.getUserSockets(invitedUser);
		this.logger.debug("invite:", invitedUser);
		this.logger.debug(sockets.length);
		if (!sockets)
		{
			this.server.to(client.id).emit('userOffline');
			return;
		}
		sockets.forEach((v) =>
		{
			// console.log("in here");
			this.server.to(v.id).emit('notification', { type: 'invite', inviter: user.userName, inviterId: user.id, gameId });
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
		this.logger.debug("declining invite from", inviterId)
		this.logger.debug(sockets.length);
		sockets.forEach((v) =>
		{
			this.server.to(v.id).emit('invitationDeclined');
		})
	}

	@SubscribeMessage('changeFriends')
	async changeFriend(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		const friends = (await this.userService.userSelect({ id: user.id }, { friends: true })).friends;
		this.socketStore.getUserSockets(user.id).forEach((v) =>
		{
			this.server.to(v.id).emit(events.UPDATE_USER, { friends });

		});
	}

	@SubscribeMessage(events.BLOCK_USER)
	async blockUser(@ConnectedSocket() client: Socket, @MessageBody('userId', ParseUUIDPipe) userId: string, @GetUserWs() user: User)
	{
		if (user.id === userId)
		{
			throw new WsException("You can't blacklist yourself !");
		}
		await this.userService.updateUser({
			where:
			{
				id: user.id,
			},
			data:
			{
				blacklist: { connect: { id: userId } }
			},
		});
		const blackList = (await this.userService.userSelect({ id: user.id }, { blacklist: true })).blacklist;
		const blockedName = blackList?.find((u) => u.id === userId).userName;
		this.socketStore.getUserSockets(user.id).forEach((v) =>
		{
			this.server.to(v.id).emit(events.UPDATE_USER, { blacklist: blackList });
			this.server.to(v.id).emit(chatEvents.NOTIFY, { content: `You have blocked ${blockedName}` })

		});
	}

	@SubscribeMessage(events.UNBLOCK_USER)
	async unblockUser(@ConnectedSocket() client: Socket, @MessageBody('userId', ParseUUIDPipe) userId: string, @GetUserWs() user: User)
	{
		if (user.id === userId)
			return;
		await this.userService.updateUser({
			where: { id: user.id },
			data:
			{
				blacklist: { disconnect: { id: userId } }
			}
		});
		const blackList = (await this.userService.userSelect({ id: user.id }, { blacklist: true })).blacklist;
		const blockedName = (await this.userService.user({ id: userId })).userName;
		this.socketStore.getUserSockets(user.id).forEach((v) =>
		{
			this.server.to(v.id).emit(events.UPDATE_USER, { blacklist: blackList });
			this.server.to(v.id).emit(chatEvents.NOTIFY, { content: `You have unblocked ${blockedName}` })
		});
	}
}
