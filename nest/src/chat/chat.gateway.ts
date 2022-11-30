import { Logger, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import
{
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
	OnGatewayConnection,
	WsException,
	OnGatewayDisconnect,
	OnGatewayInit,
	BaseWsExceptionFilter
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { Channel, ChannelMember, RoleType } from '@prisma/client';
import { Message, Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { ChannelsService } from 'src/chat/channels/channels.service';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateChatDto } from './dto';
import { GetUserWs } from 'src/users/decorator/get-user-ws';
import { CreateMessageDto } from './messages/dto';
import { WsValidationPipe } from '../websocket-server/pipes';
import { ChannelDto } from './channels/dto/channel-dto';
import { CreateUserDto } from 'src/users/dto';
import { joinChannelDto } from './channels/dto/join-channel.dto';
import { MessagesService } from './messages/messages.service';
import path from 'path';
import { CustomWsFilter } from 'src/websocket-server/filters';
import { UserInterceptor } from 'src/websocket-server/interceptor';

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: true, namespace: 'chat' })
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

	handleConnection(client: Socket)
	{
		this.logger.debug('In chat connection');
		try
		{
			const channels = client.data.user.channels;

			for (let chan of channels)
				client.join(chan.channel.id);
			this.logger.log(`Client ${client.data.user.userName} connected to chat server`);
		}
		catch (err)
		{
			this.logger.error({ err });
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket)
	{
		const user: User = client.data.user;
		this.logger.log(`Client ${user.userName} disconnected from chat server`);
	}

	/******************************************************************************************/


	@SubscribeMessage('message')
	async sendMessage(@MessageBody() dto: CreateMessageDto)
	{
		this.logger.debug('in message event', { dto });

		const newMessage: Message = await this.messageService.create(dto);
		this.server.emit('message', dto);
	}

	@SubscribeMessage('toChannel')
	toRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		console.log('in toChannel', { body });
		client.to(body.channel).emit('message', body);
	}


	/*************************/
	/*        TESTING        */
	/*************************/
	@SubscribeMessage('test')
	async test(@GetUserWs() user, @ConnectedSocket() client: Socket)
	{
		client.data.prout = { prout: 'prout', lol: 'lol' }
		this.logger.debug(client.data);
		this.logger.debug({user});
	}

	@SubscribeMessage('testMsg')
	testMsg(@MessageBody() body: any)
	{
		this.server.emit('testMsg', body);
	}
	/******************************************************************************************/
}
