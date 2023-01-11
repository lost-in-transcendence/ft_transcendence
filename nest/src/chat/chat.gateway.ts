import { Logger, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import
{
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { User } from '@prisma/client';

import { ChannelsService } from 'src/chat/channels/channels.service';
import { ChatService } from './chat.service';
import { GetUserWs } from 'src/users/decorator/get-user-ws';
import { CreateMessageDto } from './messages/dto';
import { WsValidationPipe } from '../websocket-server/pipes';
import { MessagesService } from './messages/messages.service';
import { CustomWsFilter } from 'src/websocket-server/filters';
import { UserInterceptor } from 'src/websocket-server/interceptor';
import { env } from 'process';
import { UserSocketStore } from './global/user-socket.store';
import { ChannelMemberService } from './channels/channel-member/channel-member.service';
import { ChannelMemberDto } from './channels/channel-member/dto';
import * as events from 'shared/constants'

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`, namespace: 'chat'})
	// {
	// 	origin: "http://localhost:3000",
	// 	allowedHeaders: ['Authorization'],
	// 	credentials: true,
	// 	exposedHeaders: ['Authorization']
	// }, namespace: 'chat' })
	// {
	// 	origin: '*:*',
	// 	credentials: true,
	// }, namespace: 'chat'})
	// 'http://localhost:3000'}, namespace: 'chat')
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	private readonly logger = new Logger(ChatGateway.name);

	constructor(
		private readonly chatService: ChatService,
		private readonly channelService: ChannelsService,
		private readonly messageService: MessagesService,
		private readonly channelMemberService: ChannelMemberService) { }

	@WebSocketServer()
	server: Namespace;

	/*************************/
	/*      Init Stuff       */
	/*************************/

	afterInit()
	{
		this.logger.log('Chat Gateway initialized');
	}

	async handleConnection(client: Socket)
	{
		try
		{
			UserSocketStore.setUserSockets(client.data.user.id, client)
			const naughtyList = await this.channelMemberService.amINaughty({userId: client.data.user.id});
			const channels = client.data.user.channels;

			for (let chan of naughtyList)
			{
				if (chan.role === 'BANNED' && chan.banExpires.getTime() <= Date.now())
				{
					this.channelMemberService.changeRole({
						userId: client.data.user.id,
						channelId: chan.channelId,
						role: 'MEMBER'
					});
					this.server.to(chan.channelId).emit(events.ALERT, { event: events.USERS, args: { channelId: chan.channelId } });
				}
				else if (chan.role === 'MUTED' && chan.banExpires.getTime() <= Date.now())
					this.channelMemberService.changeRole({
						userId: client.data.user.id,
						channelId: chan.channelId,
						role: 'MEMBER'
					})
			}
			for (let chan of channels)
				client.join(chan.channel.id);
			this.logger.log(`Client ${client.data.user.userName} connected to chat server`);
			// client.emit('channels');
		}
		catch (err)
		{
			this.logger.error({ err });
			client.disconnect();
		}
	}

	async handleDisconnect(client: Socket)
	{
		const user: User = client.data.user;
		UserSocketStore.removeUserSocket(client.data.user.id, client);
		this.logger.log(`Client ${user.userName} disconnected from chat server`);
	}

	/******************************************************************************************/


	@SubscribeMessage('message')
	async sendMessage(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		const banned = this.channelMemberService.getBannedFromChannels({userId: user.id});
		this.logger.debug({banned});
	}

	@SubscribeMessage('toChannel')
	async toRoom(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket, @GetUserWs() user: any)
	{
		const channelMember = await this.channelMemberService.getOne({channelId: dto.channelId, userId: user.id , role: null})

		if (!channelMember || channelMember.role === "BANNED" || channelMember.role === "MUTED")
		{
			if (channelMember.role === "MUTED" && channelMember.muteExpires.getTime() <= Date.now())
			{
				this.channelMemberService.changeRole({channelId: dto.channelId, userId: user.id, role: "MEMBER"})
				this.server.to(dto.channelId).emit(events.ALERT, {event: events.USERS, args: {channelId: dto.channelId}})
			}
			else
				return ;
		}

		const newMessage = await this.messageService.create({
			content: dto.content,
			channel: { connect: { id: dto.channelId } },
			sender: { connect: { id: user.id } }
		});
		this.server.to(dto.channelId).emit('toChannel', newMessage);
	}

	/*************************/
	/*        TESTING        */
	/*************************/
	@SubscribeMessage('test')
	async test(@GetUserWs() user, @ConnectedSocket() client: Socket)
	{
		client.data.prout = { prout: 'prout', lol: 'lol' }
	}

	@SubscribeMessage('testMsg')
	testMsg(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		this.server.emit('testMsg', body);
	}
	/******************************************************************************************/
}
