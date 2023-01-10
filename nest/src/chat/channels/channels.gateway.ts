import { Body, ForbiddenException, Get, Global, Logger, ParseIntPipe, ParseUUIDPipe, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Prisma, User, Channel, ChannelMember, Message, RoleType } from "@prisma/client";
import { IsString } from "class-validator";
import { Namespace, Server, Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { emit, env } from "process";

import { GetUserWs } from "src/users/decorator/get-user-ws";
import { CustomWsFilter } from "src/websocket-server/filters";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { ChannelsService } from "./channels.service";
import { ChannelDto, CreateChannelDto, PartialChannelDto, UpdateChannelDto } from "./dto";
import { joinChannelDto, joinChannelMessageDto } from "./dto/join-channel.dto";
import { UserInterceptor } from "src/websocket-server/interceptor";
import { UsersService } from "src/users/users.service";
import * as events from 'shared/constants';
import { MessagesService } from "../messages/messages.service";
import { getManyMessageDto } from "../messages/dto";
import { SharedChannelMembersDto, SharedPartialUserDto } from "shared/dtos";
import { UserSocketStore } from "../global/user-socket.store";
import { ChannelMemberDto, UpdateChannelMemberDto } from "./channel-member/dto";
//import { env } from "process";
import { ChannelMemberService } from "./channel-member/channel-member.service";

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`, namespace: 'chat' })
export class ChannelsGateway implements OnGatewayConnection
{
	private readonly logger = new Logger(ChannelsGateway.name);

	constructor(private readonly channelService: ChannelsService,
		private readonly userService: UsersService,
		private readonly messageService: MessagesService,
		private readonly channelMemberService: ChannelMemberService) { }

	@WebSocketServer()
	server: Namespace;

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
		const dto: joinChannelDto = {
			userId: user.id,
			channelId: body.channelId,
			role: 'MEMBER'
		}
		const channelMember = await this.channelMemberService.getOne(dto)
		if (channelMember && channelMember.role === 'BANNED')
			return;
		const channel: Channel = await this.channelService.findOne({ id: dto.channelId });

		if (channel.mode === 'PRIVATE' && !channel.whitelist.includes(user.id))
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
		this.server.to(joinedChannel.id).emit(events.USERS, members);
		const newChanList = await this.getVisibleChannels(user.id);
		this.server.to(client.id).emit('channels', newChanList);
	}

	@SubscribeMessage(events.LEAVE_CHANNEL)
	async leaveChannel(
		@MessageBody('channelId') channelId: string,
		@ConnectedSocket() client: Socket,
		@GetUserWs() user: any)
	{
		const channelMemberDto: ChannelMemberDto = {
			userId: client.data.user.id,
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
				client.leave(channelId);
				this.DstroyChannel(channelId)
				const newChanList = await this.getVisibleChannels(user.id);
			}
		}
		if (channelMember.role !== 'BANNED')
			await this.channelService.leaveChannel({ userId_channelId: { userId: user.id, channelId } });
		client.leave(channelId);
		this.notify(channelId, `${user.userName} has left the channel`);
		this.alert({ event: events.CHANNELS });
		this.alert({ event: events.USERS, args: { channelId: channelId } });
	}

	@SubscribeMessage(events.BAN_USER)
	async banUser(/*@ConnectedSocket() client: Socket, */@MessageBody() body: any)
	{
		const array: Socket[] = UserSocketStore.getUserSockets(body.userId);
		for (let n of array)
			n.leave(body.channelId)
		return (this.channelService.banUser(body.userId, body.channelId))
	}
	@SubscribeMessage(events.UNBAN_USER)
	async unbanUser(@MessageBody() body: any)
	{
		return (this.channelService.unbanUser(body.userId, body.channelId))
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
		const users: SharedChannelMembersDto[] | ChannelMember[] = await this.getUsersFromChannel({ channelId, userId });
		this.logger.debug({ users });
		if (!users)
			throw new WsException({ status: '401', message: 'You are not part of this channel' });
		this.server.to(client.id).emit(events.USERS, users);
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
	async promoteUser(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody() dto: UpdateChannelMemberDto)
	{
		const currentUser = await this.channelMemberService.getOne({channelId: dto.channelId, userId: user.id});
		if (currentUser.role !== 'OWNER')
			throw new WsException({status: '401', message: 'You are not the owner of this channel'});
		await this.channelMemberService.changeRole({userId: dto.userId, channelId: dto.channelId, role: 'ADMIN'});
		const newMemberList = await this.getUsersFromChannel({channelId: dto.channelId, userId: user.id});
		this.server.to(dto.channelId).emit(events.USERS, newMemberList);
	}

	@SubscribeMessage(events.DEMOTE_USER)
	async demoteUser(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody() dto: UpdateChannelMemberDto)
	{
		const currentUser = await this.channelMemberService.getOne({channelId: dto.channelId, userId: user.id});
		if (currentUser.role !== 'OWNER')
			throw new WsException({status: '401', message: 'You are not the owner of this channel'});
		await this.channelMemberService.changeRole({userId: dto.userId, channelId: dto.channelId, role: 'MEMBER'});
		const newMemberList = await this.getUsersFromChannel({channelId: dto.channelId, userId: user.id});
		this.server.to(dto.channelId).emit(events.USERS, newMemberList);
	}

	/*************************/
	/*        UTILS          */
	/*************************/

	async getUsersFromChannel({ channelId, userId }: { channelId: string, userId: string }): Promise<SharedChannelMembersDto[]>
	{
		const channels: PartialChannelDto[] = await this.getVisibleChannels(userId);
		const users: SharedChannelMembersDto[] = channels.find((c) => c.id === channelId).members;
		return (users);
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

	async DstroyChannel(channelId: string)
	{
		// TODO Handle destroy message

		this.channelService.remove(channelId);
		this.server.socketsLeave(channelId);
	}

	notify(channelId: string, content: string)
	{
		this.server.to(channelId).emit(events.NOTIFY, { channelId, content });
	}

	alert({ event, args }: { event: string, args?: any })
	{
		this.server.emit(events.ALERT, { event, args });
	}
}
