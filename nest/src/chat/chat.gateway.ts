import { Global, Logger, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
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
		private readonly messageService: MessagesService) { }

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
		this.logger.debug('In chat connection');
		try
		{
			UserSocketStore.setUserSockets(client.data.user.id, client.id)
			this.logger.debug("COUCOU:", UserSocketStore.getUserSockets(client.id))
			const channels = client.data.user.channels;
			this.logger.debug("hellooo");
			for (let chan of channels)
				client.join(chan.channel.id);
			this.logger.log(`Client ${client.data.user.userName} connected to chat server`);
			client.emit('channels');
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
		this.logger.log(`Client ${user.userName} disconnected from chat server`);
	}

	/******************************************************************************************/


	@SubscribeMessage('message')
	async sendMessage(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket, @GetUserWs() user)
	{
		this.logger.debug('in message event', { dto });

		const newDto = { ...dto, userId: user.id }
		// const newMessage: Message = await this.messageService.create(newDto);
		this.server.emit('message', dto);
	}

	@SubscribeMessage('toChannel')
	async toRoom(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket, @GetUserWs() user)
	{
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
		this.logger.debug(client.data);
		this.logger.debug({ user });
	}

	@SubscribeMessage('testMsg')
	testMsg(@MessageBody() body: any)
	{
		this.server.emit('testMsg', body);
	}
	/******************************************************************************************/
}
