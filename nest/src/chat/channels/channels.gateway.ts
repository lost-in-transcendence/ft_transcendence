import { ForbiddenException, Get, Global, Logger, ParseIntPipe, ParseUUIDPipe, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Prisma, User, Channel, ChannelMember } from "@prisma/client";
import { IsString } from "class-validator";
import { Namespace, Server, Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';
import { env } from "process";

import { GetUserWs } from "src/users/decorator/get-user-ws";
import { CustomWsFilter } from "src/websocket-server/filters";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { ChannelsService } from "./channels.service";
import { ChannelDto, CreateChannelDto, PartialChannelDto } from "./dto";
import { joinChannelDto, joinChannelMessageDto } from "./dto/join-channel.dto";
import { UserInterceptor } from "src/websocket-server/interceptor";
import { UsersService } from "src/users/users.service";
import * as events from 'shared/constants';

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`, namespace: 'chat'})
export class ChannelsGateway implements OnGatewayConnection
{
	private readonly logger = new Logger(ChannelsGateway.name);

	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

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
		this.logger.debug({newChannel});
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
		this.logger.debug({retChannel});
		if (dto.mode === 'PROTECTED' || dto.mode === 'PUBLIC')
			this.server.emit(events.NEW_CHANNEL, retChannel);
		else
			this.server.to(client.id).emit(events.NEW_CHANNEL, retChannel);
	}

	@SubscribeMessage(events.JOIN_CHANNEL)
	async join(
		@MessageBody() body: joinChannelMessageDto,
		@ConnectedSocket() client: Socket,
		@GetUserWs() user: User)
	{
		const joinedChans: any[] = client.data.user.channels;
		const thisChan = joinedChans?.find((c) => c.channelId === body.channelId);
		if (thisChan?.role === 'BANNED')
			return ;
		const dto: joinChannelDto = {
			channelId: body.channelId,
			userId: user.id,
			role: 'MEMBER'
		}
		const channel: Channel = await this.channelService.findOne({ id: dto.channelId });

		if (channel.mode === 'PRIVATE' && !channel.whitelist.includes(user.id))
			throw new WsException({ status: 'Unauthorized', message: 'Channel is Private ! Get out of here !' });
		if (channel.mode === 'PROTECTED')
		{
			const compare = await bcrypt.compare(body.password || "", channel.hash);
			this.logger.debug({ compare });
			if (!compare)
				throw new WsException({ status: 'Unauthorized', message: 'Incorrect password' });
		}

		const joinedChannel =
			(
				await this.channelService.joinChannel(dto)
					.then((c) => c.channel)
			);
		this.logger.debug({ joinedChannel });
		const members = joinedChannel.members;
		this.server.to(joinedChannel.id).emit(events.USERS, {users: members});
		client.join(joinedChannel.id);
		this.notify(joinedChannel.id, `${user.userName} has joined ${joinedChannel.channelName} !`)
		const newChanList = await this.getVisibleChannels(user.id);
		this.server.to(client.id).emit('channels', newChanList);
	}

	@SubscribeMessage(events.LEAVE_CHANNEL)
	async leaveChannel(
		@MessageBody('channelId') channelId: string,
		@ConnectedSocket() client: Socket,
		@GetUserWs() user: any)
	{
		const joinedChans: any[] = user.channels;
		const thisChan = joinedChans.find((c) => c.channelId === channelId);
		if (!thisChan)
			throw new WsException({ status: 'Error', message: 'Cannot leave channel you are not a part of !' });
		if (thisChan.role === 'OWNER')
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
				return (this.DstroyChannel(channelId));
		}
		if (thisChan.role !== 'BANNED')
			await this.channelService.leaveChannel({userId_channelId: {userId: user.id, channelId}});
		client.leave(channelId);
		this.notify(channelId, `${user.userName} has left the channel`);
		const res: {members?: ChannelMember[]} = await this.channelService.channelSelect({
			where: { id: channelId },
			select:
			{
				members: true
			}
		});
		const members = res.members;
		this.logger.debug({members});
		this.server.to(channelId).emit(events.USERS, {members});
		// TODO Handle leave message
	}

	@SubscribeMessage('ban')
	async banUser(
		@ConnectedSocket() client: Socket,
		@MessageBody('channelId') channelId: string
		)
	{
		return (this.channelService.banUser(client.data.user.id, channelId))
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

	// @SubscribeMessage('handshake')
	// async handshake(@ConnectedSocket() client: Socket, @GetUserWs('id', ParseUUIDPipe) userId: string)
	// {
	// 	this.logger.debug('Receiving handshake event from client in channels gateway');
	// 	const channels: PartialChannelDto[] = await this.getVisibleChannels(userId);
	// 	this.server.to(client.id).emit('handshake', channels);
	// }

	/*************************/
	/*        UTILS          */
	/*************************/

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
			},
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
		this.server.to(channelId).emit(events.NOTIFY, content);
	}

	alert(channelId: string, content: string)
	{
		this.server.to(channelId).emit(events.ALERT, content);
	}
}
