import { ForbiddenException, Logger, ParseIntPipe, ParseUUIDPipe, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Prisma, User, Channel, ChannelMember } from "@prisma/client";
import { IsString } from "class-validator";
import { Namespace, Server, Socket } from 'socket.io';
import * as bcrypt from 'bcrypt';

import { GetUserWs } from "src/users/decorator/get-user-ws";
import { CustomWsFilter } from "src/websocket-server/filters";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { ChannelsService } from "./channels.service";
import { ChannelDto, CreateChannelDto, PartialChannelDto } from "./dto";
import { joinChannelDto, joinChannelMessageDto } from "./dto/join-channel.dto";
import { UserInterceptor } from "src/websocket-server/interceptor";
import { UsersService } from "src/users/users.service";

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChannelsGateway
{
	private readonly logger = new Logger(ChannelsGateway.name);

	constructor(private readonly channelService: ChannelsService, private readonly userService: UsersService) { }

	@WebSocketServer()
	server: Namespace;

	@SubscribeMessage('createChannel')
	async createChannel(@MessageBody() dto: CreateChannelDto, @GetUserWs('id', ParseUUIDPipe) id: string, @ConnectedSocket() client: Socket)
	{
		const newChannel: PartialChannelDto = await this.channelService.create(dto, id);
		const visibleChans = await this.getVisibleChannels();
		client.join(newChannel.id);
		if (dto.mode === 'PROTECTED' || dto.mode === 'PUBLIC')
			this.server.emit('channels', visibleChans);
	}

	@SubscribeMessage('joinChannel')
	async join(
		@MessageBody() body: joinChannelMessageDto,
		@ConnectedSocket() client: Socket,
		@GetUserWs() user: User)
	{
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
		client.join(joinedChannel.id);
		client.to(joinedChannel.id).emit('message', { text: `${user.userName} has joined ${joinedChannel.channelName} ! Welcome ! lol` });
	}

	@SubscribeMessage('leaveChannel')
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
		await this.channelService.leaveChannel({userId_channelId: {userId: user.id, channelId}});
		client.leave(channelId);
		// TODO Handle leave message
	}

	@SubscribeMessage('channels')
	async channels(@ConnectedSocket() client: Socket)
	{
		const visibleChans = await this.getVisibleChannels();
		this.server.to(client.id).emit('channels', visibleChans);
	}


	/*************************/
	/*        UTILS          */
	/*************************/

	async getVisibleChannels(): Promise<PartialChannelDto[]>
	{
		const visibleChans: PartialChannelDto[] = await this.channelService.channels({
			where:
			{
				OR:
					[
						{ mode: 'PUBLIC' },
						{ mode: 'PROTECTED' }
					]
			},
			select:
			{
				id: true,
				mode: true,
				channelName: true,
			}
		});
		return (visibleChans);
	}

	async DstroyChannel(channelId: string)
	{
		// TODO Handle destroy message

		this.channelService.remove(channelId);
		this.server.socketsLeave(channelId);
	}
}
