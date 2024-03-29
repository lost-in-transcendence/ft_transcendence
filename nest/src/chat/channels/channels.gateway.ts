import { Logger, ParseUUIDPipe, UseFilters, UseInterceptors, UsePipes } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Prisma, User, Channel, ChannelMember, Message, RoleType, ChannelModeType } from "@prisma/client";
import { Namespace, Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { env } from "process";

import { GetUserWs } from "src/users/decorator/get-user-ws";
import { CustomWsFilter } from "src/websocket-server/filters";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto, PartialChannelDto, UpdateChannelDto } from "./dto";
import { joinChannelDto, joinChannelMessageDto } from "./dto/join-channel.dto";
import { UserInterceptor } from "src/websocket-server/interceptor";
import { UsersService } from "src/users/users.service";
import * as events from 'shared/constants';
import { MessagesService } from "../messages/messages.service";
import { getManyMessageDto } from "../messages/dto";
import { SharedChannelMembersDto} from "shared/dtos";
import { UserSocketStore } from "../global/user-socket.store";
import { BanMemberDto, ChannelInviteDto, ChannelMemberDto, KickUserDto, UpdateChannelMemberDto } from "./channel-member/dto";
import { ChannelMemberService } from "./channel-member/channel-member.service";
import { TimeoutStore } from "../global/timeout-store";
import { CleanupService, UserCleanup } from "src/websocket-server/cleanup.service";

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.FRONT_URL}`, namespace: 'chat' })
export class ChannelsGateway implements OnGatewayConnection
{
	private readonly logger = new Logger(ChannelsGateway.name);

	constructor(private readonly channelService: ChannelsService,
		private readonly userService: UsersService,
		private readonly messageService: MessagesService,
		private readonly channelMemberService: ChannelMemberService,
		private readonly cleanupService: CleanupService) { }

	@WebSocketServer()
	server: Namespace;

	afterInit()
	{
		// const intervalId = setInterval(() => this.cleanupUsers(), 30 * 1000);
	}

	async handleConnection(client: Socket)
	{
		const initChannels = await this.getVisibleChannels(client.data.user.id);
		this.server.to(client.id).emit('handshake', initChannels);
	}

	@SubscribeMessage(events.CREATE_CHANNEL)
	async createChannel(@MessageBody() dto: CreateChannelDto, @GetUserWs('id', ParseUUIDPipe) id: string, @ConnectedSocket() client: Socket)
	{
		const newChannel: PartialChannelDto = await this.channelService.create(dto, id);
		client.join(newChannel.id);
		const retChannel = await this.channelService.channelSelect({
			where: { id: newChannel.id },
			select:
			{
				id: true,
				mode: true,
				channelName: true,
				members:
				{
					include:
					{
						user:
						{
							select:
							{
								id: true,
								userName: true,
								status: true,
							}
						}
					}
				}
			}
		})
		if (dto.mode === 'PROTECTED' || dto.mode === 'PUBLIC')
			this.server.emit(events.NEW_CHANNEL, retChannel);
		else
			this.server.to(client.id).emit(events.NEW_CHANNEL, retChannel);
		this.server.to(client.id).emit(events.UPDATE_ACTIVE_CHAN, newChannel);
	}

	@SubscribeMessage(events.NEW_PRIVMSG)
	async newPrivmsg(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('userId', ParseUUIDPipe) userId: string)
	{
		const currentUserSocketIds = UserSocketStore.getUserSockets(user.id);
		const targetUserSocketIds = UserSocketStore.getUserSockets(userId);
		const channelName: string = userId > user.id ? userId + '_' + user.id : user.id + '_' + userId;
		const channelExists = await this.channelService.channels({where: {channelName}});
		if (channelExists.length !== 0)
			return;
		const dto: CreateChannelDto = { channelName, mode: 'PRIVMSG' };
		const newChannel: PartialChannelDto = await this.channelService.create(dto, user.id);
		await this.channelService.joinChannel({ userId, channelId: newChannel.id, role: 'MEMBER' });

		currentUserSocketIds.forEach((u) =>
		{
			u.join(newChannel.id);
			this.server.to(u.id).emit(events.ALERT, { event: events.CHANNELS });
		});
		targetUserSocketIds.forEach((u) =>
		{
			u.join(newChannel.id);
			this.server.to(u.id).emit(events.ALERT, { event: events.CHANNELS });
		})
		this.server.to(client.id).emit(events.UPDATE_ACTIVE_CHAN, newChannel);
	}

	@SubscribeMessage(events.JOIN_CHANNEL)
	async join(
		@MessageBody() body: joinChannelMessageDto,
		@ConnectedSocket() client: Socket,
		@GetUserWs() user: User)
	{

		const channelMember = await this.channelMemberService.getOne({ userId: user.id, channelId: body.channelId })
		let dto: joinChannelDto;
		if (channelMember)
		{
			dto = {
				userId: user.id,
				channelId: body.channelId,
				role: channelMember.role
			}
		}
		else
			dto = {
				userId: user.id,
				channelId: body.channelId,
				role: "MEMBER"
			}

		if (channelMember && channelMember.role === 'BANNED')
			return;
		const channel: Channel = await this.channelService.findOne({ id: dto.channelId });

		if (channel.mode === 'PRIVATE' && channelMember.role !== "INVITED")
			throw new WsException({ status: 'Unauthorized', message: 'Channel is Private ! Get out of here !' });
		if (channel.mode === 'PROTECTED')
		{
			const compare = await bcrypt.compare(body.password || "", channel.hash);
			if (!compare)
				throw new WsException({ status: 'Unauthorized', message: 'Incorrect password' });
		}

		const joinedChannel =
			(
				await this.channelService.joinChannel(dto)
					.then((c) => c.channel)
			);
		this.notify(joinedChannel.id, `${user.userName} has joined ${joinedChannel.channelName} !`)
		client.join(joinedChannel.id);
		const members = await this.getUsersFromChannel({ channelId: joinedChannel.id, userId: user.id });
		if (!members)
			throw new WsException({ status: '401', message: 'You are not part of this channel' });
		this.server.to(joinedChannel.id).emit(events.ALERT, { event: events.USERS, args: { channelId: joinedChannel.id} });
		const newChanList = await this.getVisibleChannels(user.id);
		this.server.to(client.id).emit('channels', newChanList);
	}

	@SubscribeMessage(events.LEAVE_CHANNEL)
	async leaveChannelMessage(
		@MessageBody('channelId', ParseUUIDPipe) channelId: string,
		@ConnectedSocket() client: Socket,
		@GetUserWs() user: any)
	{
		client.leave(channelId);
		this.leaveChannel(channelId, user.id, user.userName);
		this.server.to(client.id).emit(events.ALERT, { event: events.CHANNELS })
		// let deleteChan: boolean = false;
		// const channelMemberDto: ChannelMemberDto = {
		// 	userId: client.data.user.id,
		// 	channelId,
		// 	role: null
		// }
		// const channelMember = await this.channelMemberService.getOne(channelMemberDto);

		// if (!channelMember)
		// 	throw new WsException({ status: 'Error', message: 'Cannot leave channel you are not a part of !' });
		// if (channelMember.role === 'OWNER')
		// {
		// 	const channel: Channel & { members?: ChannelMember[] } = await this.channelService.channel({
		// 		where: { id: channelId },
		// 		include:
		// 		{
		// 			members:
		// 			{
		// 				orderBy: { role: 'asc' },
		// 				where:
		// 				{
		// 					OR:
		// 						[
		// 							{ role: 'ADMIN' },
		// 							{ role: 'MEMBER' }
		// 						]
		// 				}
		// 			}
		// 		}
		// 	});
		// 	const members: ChannelMember[] = channel.members;
		// 	if (members.length > 0)
		// 	{
		// 		await this.userService.updateUser({
		// 			where: { id: members[0].userId },
		// 			data:
		// 			{
		// 				channels:
		// 				{
		// 					update:
		// 					{
		// 						where: { userId_channelId: { userId: members[0].userId, channelId } },
		// 						data: { role: 'OWNER' }
		// 					}
		// 				}
		// 			}
		// 		});
		// 	}
		// 	else
		// 	{
		// 		await this.DstroyChannel(channelId)
		// 		deleteChan = true;
		// 	}
		// }
		// client.leave(channelId);
		// if (!deleteChan)
		// {
		// 	if (channelMember.role !== 'BANNED')
		// 		await this.channelService.leaveChannel({ userId_channelId: { userId: user.id, channelId } });
		// 	TimeoutStore.clearTimeoutId({userId: user.id, channelId})
		// 	this.notify(channelId, `${user.userName} has left the channel`);
		// 	this.server.to(channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: channelId} });
		// }
		// else
		// 	this.alert({ event: events.CHANNELS });
		// this.server.to(client.id).emit(events.ALERT, { event: events.CHANNELS })
	}

	@SubscribeMessage(events.GET_BANNED_USERS)
	async getBannedUsers(@MessageBody('channelId', ParseUUIDPipe) channelId: string, @ConnectedSocket() client: Socket)
	{
		const banList = await this.channelMemberService.getBanList({ channelId });
		this.server.to(client.id).emit(events.GET_BANNED_USERS, banList);
	}

	@SubscribeMessage(events.KICK_USER)
	async kickUser(@MessageBody() body: KickUserDto, @GetUserWs() user: User)
	{
		const sockets = UserSocketStore.getUserSockets(body.userId);
		await this.channelMemberService.kickUser(body);
		sockets.forEach((s: Socket) =>
		{
			s.leave(body.channelId);
			this.server.to(s.id).emit(events.UNSET_ACTIVE_CHAN, {channelId: body.channelId});
			this.server.to(s.id).emit(events.ALERT, { event: events.CHANNELS});

		})
		this.server.to(body.channelId).emit(events.NOTIFY, { channelId: body.channelId, content: `${body.userName} has been kicked by ${user.userName}`})
		this.server.to(body.channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: body.channelId}});
	}

	@SubscribeMessage(events.BAN_USER)
	async banUser(@ConnectedSocket() client: Socket, @MessageBody() body: BanMemberDto, @GetUserWs() user: User)
	{
		const array: Socket[] = UserSocketStore.getUserSockets(body.userId);
		await this.channelMemberService.banUser(body);
		for (let n of array)
		{
			n.leave(body.channelId)
			this.server.to(n.id).emit(events.ALERT, { event: events.CHANNELS });
		}
		this.server.to(body.channelId).emit(events.NOTIFY, { channelId: body.channelId, content: `${body.userName} has been banned by ${user.userName}` })
		this.server.to(body.channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: body.channelId } });

		TimeoutStore.setTimeoutId(
			{userId: body.userId, channelId: body.channelId},
			setTimeout(() => this.unbanUser(body.userId, body.channelId), body.banTime));
	}

	async unbanUser(userId: string, channelId: string)
	{
		await this.channelService.leaveChannel({ userId_channelId: { userId, channelId } });
		this.server.to(channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: channelId } });
		const userSockets = UserSocketStore.getUserSockets(userId);
		userSockets.forEach((v) =>
		{
			this.server.to(v.id).emit(events.ALERT, {event: events.CHANNELS});
		})
	}

	async unmuteUser(userId: string, channelId: string)
	{
		await this.channelMemberService.changeRole({
			userId: userId,
			channelId: channelId,
			role: 'MEMBER'
		})
		this.server.to(channelId).emit(events.ALERT, {event: events.USERS, args: {channelId: channelId}})
	}

	@SubscribeMessage(events.MUTE_USER)
	async muteUser(@MessageBody() body: BanMemberDto, @GetUserWs() user: User)
	{
		await this.channelMemberService.muteUser(body)
		this.server.to(body.channelId).emit(events.NOTIFY, { channelId: body.channelId, content: `${body.userName} has been muted by ${user.userName}` })
		this.server.to(body.channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: body.channelId } })
		TimeoutStore.setTimeoutId(
			{userId: body.userId, channelId: body.channelId},
			setTimeout(() => this.unmuteUser(body.userId, body.channelId), body.banTime)
			)
	}

	@SubscribeMessage(events.CHANNELS)
	async channels(@ConnectedSocket() client: Socket, @GetUserWs('id', ParseUUIDPipe) userId: string)
	{
		const visibleChans: PartialChannelDto[] = await this.getVisibleChannels(userId);
		this.server.to(client.id).emit(events.CHANNELS, visibleChans);
	}

	@SubscribeMessage(events.JOINED_CHANNELS)
	async joinedChannels(@ConnectedSocket() client: Socket, @GetUserWs('id', ParseUUIDPipe) userId: string)
	{
		const joinedChans: PartialChannelDto[] = await this.getJoinedChannels(userId);
		this.server.to(client.id).emit(events.JOINED_CHANNELS, joinedChans);
	}

	@SubscribeMessage(events.JOINABLE_CHANNELS)
	async joinableChans(@ConnectedSocket() client: Socket, @GetUserWs('id', ParseUUIDPipe) userId: string)
	{
		const joignableChans: PartialChannelDto[] = await this.getJoinableChannels(userId);
		this.server.to(client.id).emit(events.JOINABLE_CHANNELS, joignableChans);
	}

	@SubscribeMessage(events.GET_MESSAGES)
	async GetMessages(@ConnectedSocket() client: Socket, @MessageBody() dto: getManyMessageDto)
	{
		const messages: Message[] = await this.messageService.getMany(dto.channelId, dto.amount);
		this.server.to(client.id).emit(events.GET_MESSAGES, messages);
	}

	@SubscribeMessage(events.USERS)
	async channelUsers(@ConnectedSocket() client: Socket, @MessageBody('channelId', ParseUUIDPipe) channelId: string, @GetUserWs('id', ParseUUIDPipe) userId: string)
	{
		const users: SharedChannelMembersDto[] = await this.getUsersFromChannel({ channelId, userId });
		if (!users)
			throw new WsException({ status: '401', message: 'You are not part of this channel' });
		this.server.to(client.id).emit(events.USERS, {channelId, users});
	}

	@SubscribeMessage(events.UPDATE_CHANNEL_INFO)
	async updateChannel(@MessageBody() dto: UpdateChannelDto)
	{
		let data: Prisma.ChannelUpdateInput = { channelName: dto.channelName, mode: dto.mode };

		if (dto.mode === 'PROTECTED')
		{
			const hash = await bcrypt.hash(dto.password || '', 10);
			data.hash = hash;
		}
		await this.channelService.update({ id: dto.channelId }, data);
		this.alert({ event: events.CHANNELS });
	}

	@SubscribeMessage(events.PROMOTE_USER)
	async promoteUser(@GetUserWs() user: User, @MessageBody() dto: UpdateChannelMemberDto)
	{
		const currentUser = await this.channelMemberService.getOne({ channelId: dto.channelId, userId: user.id });
		if (currentUser.role !== 'OWNER')
			throw new WsException({ status: '401', message: 'You are not the owner of this channel' });
		await this.channelMemberService.changeRole({ userId: dto.userId, channelId: dto.channelId, role: 'ADMIN' });
		this.server.to(dto.channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: dto.channelId} });
	}

	@SubscribeMessage(events.DEMOTE_USER)
	async demoteUser(@GetUserWs() user: User, @MessageBody() dto: UpdateChannelMemberDto)
	{
		const currentUser = await this.channelMemberService.getOne({ channelId: dto.channelId, userId: user.id });
		if (currentUser.role !== 'OWNER')
			throw new WsException({ status: '401', message: 'You are not the owner of this channel' });
		await this.channelMemberService.changeRole({ userId: dto.userId, channelId: dto.channelId, role: 'MEMBER' });
		this.server.to(dto.channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: dto.channelId} });
	}

	@SubscribeMessage(events.INVITE_TO_PRIVATE_CHANNEL)
	async inviteToPrivateChannel(@MessageBody() body: ChannelInviteDto)
	{
		for (let invitedUser of body.usersToInvite)
		{
			await this.channelMemberService.create({ userId: invitedUser, channelId: body.channelId, role: 'INVITED' });
			const socketIds = UserSocketStore.getUserSockets(invitedUser);
			socketIds.forEach((s) =>
			{
				this.server.to(s.id).emit(events.ALERT, { event: events.CHANNELS });
			})
			this.server.to(body.channelId).emit(events.ALERT, {event: events.CHANNELS});
		}
	}

	/*************************/
	/*        UTILS          */
	/*************************/

	async getUsersFromChannel({ channelId, userId }: { channelId: string, userId: string }): Promise<SharedChannelMembersDto[]>
	{
		let users: SharedChannelMembersDto[] = []
		const channels: PartialChannelDto[] = await this.getVisibleChannels(userId);
		const currentChannel = channels.find((c) => c.id === channelId);
		if (currentChannel)
			users = currentChannel.members;
		const ret = users.filter((u) => u.role !== 'BANNED');
		return (ret);
	}

	async getVisibleChannels(userId: string): Promise<PartialChannelDto[]>
	{
		const visibleChans: PartialChannelDto[] = await this.channelService.channels({
			where:
			{
				OR:
					[
						{ mode: 'PUBLIC' },
						{ mode: 'PROTECTED' },
						{ members: { some: { userId } } }
					],
				NOT:
					[
						{
							members: { some: { userId, role: RoleType.BANNED } }
						}
					]
			},
			select:
			{
				id: true,
				mode: true,
				channelName: true,
				members:
				{
					select:
					{
						role: true,
						timeJoined: true,
						user:
						{
							select:
							{
								id: true,
								userName: true,
								status: true,
								gameStatus: true,
								avatarPath: true
							}
						}
					}
				}
			}
		});
		return (visibleChans);
	}

	async getJoinedChannels(userId: string): Promise<PartialChannelDto[]>
	{
		const joinedChans: PartialChannelDto[] = await this.channelService.channels({
			where:
			{
				members:
				{
					some:
					{
						userId: userId
					}
				}
			},
			select:
			{
				id: true,
				mode: true,
				channelName: true,
			}
		});
		return (joinedChans);
	}

	async getJoinableChannels(userId: string): Promise<PartialChannelDto[]>
	{
		const otherChans: PartialChannelDto[] = await this.channelService.channels({
			where:
			{
				OR:
					[
						{ mode: 'PUBLIC' },
						{ mode: 'PROTECTED' }
					],
				AND:
				{
					members: { every: { NOT: { userId: userId } } }
				}
			},
			select:
			{
				id: true,
				mode: true,
				channelName: true,
			}
		});
		return (otherChans);
	}

	async leaveChannel(channelId: string, userId: string, userName: string)
	{
		let deleteChan: boolean = false;
		const channelMemberDto: ChannelMemberDto = {
			userId,
			channelId,
			role: null
		}
		const channelMember = await this.channelMemberService.getOne(channelMemberDto);

		if (!channelMember)
			throw new WsException({ status: 'Error', message: 'Cannot leave channel you are not a part of !' });
		if (channelMember.role === 'OWNER')
		{
			const channel: Channel & { members?: ChannelMember[] } = await this.channelService.channel({
				where: { id: channelId },
				include:
				{
					members:
					{
						orderBy: { role: 'asc' },
						where:
						{
							OR:
								[
									{ role: 'ADMIN' },
									{ role: 'MEMBER' }
								]
						}
					}
				}
			});
			const members: ChannelMember[] = channel.members;
			if (members.length > 0)
			{
				await this.userService.updateUser({
					where: { id: members[0].userId },
					data:
					{
						channels:
						{
							update:
							{
								where: { userId_channelId: { userId: members[0].userId, channelId } },
								data: { role: 'OWNER' }
							}
						}
					}
				});
			}
			else
			{
				await this.DstroyChannel(channelId)
				deleteChan = true;
			}
		}
		if (!deleteChan)
		{
			if (channelMember.role !== 'BANNED')
				await this.channelService.leaveChannel({ userId_channelId: { userId: userId, channelId } });
			TimeoutStore.clearTimeoutId({userId: userId, channelId})
			this.notify(channelId, `${userName} has left the channel`);
			this.server.to(channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: channelId} });
		}
	}

	async DstroyChannel(channelId: string)
	{
		// TODO Handle destroy message

		const banList = await this.channelMemberService.getBanList({channelId});
		const muteList = await this.channelMemberService.getMuteList({channelId});
		// const fullList = await this.channelMemberService.findMany({where: {channelId}});
		banList.forEach((v) =>
		{
			TimeoutStore.clearTimeoutId({userId: v.user.id, channelId})
		});
		muteList.forEach((v) =>
		{
			TimeoutStore.clearTimeoutId({userId: v.user.id, channelId})
		});
		await this.channelService.remove(channelId);
		this.server.socketsLeave(channelId);
		this.alert({event: events.CHANNELS})
	}

	// async cleanupUsers()
	// {
	// 	const usersToDelete: UserCleanup[] = this.cleanupService.getUsersToDelete();
	// 	this.logger.debug("User Cleanup");
	// 	if (usersToDelete.length === 0)
	// 		return;
	// 	usersToDelete.forEach(async (v) =>
	// 	{
	// 		const {user, ready} = v;
	// 		if (ready === true)
	// 			return;
	// 		// get user's joined channel list
	// 		// call this.leaveChannel() on each channel
	// 		// delete each channel whose mode === ChannelModeType.PRIVMSG
	// 		const chans: PartialChannelDto[] = await this.getJoinedChannels(user.id);
	// 		for (const channel of chans)
	// 		{
	// 			await this.leaveChannel(channel.id, user.id, user.userName);
	// 			if (channel.mode === ChannelModeType.PRIVMSG)
	// 				await this.DstroyChannel(channel.id);
	// 		}
	// 		// this.cleanupService.markUserAsReady(user.id);
	// 		await this.userService.deleteUser({id: user.id});
	// 		this.cleanupService.removeUserToDelete(user.id);
	// 	})
	// }

	notify(channelId: string, content: string)
	{
		this.server.to(channelId).emit(events.NOTIFY, { channelId, content });
	}

	alert({ event, args }: { event: string, args?: any })
	{
		this.server.emit(events.ALERT, { event, args });
	}
}
