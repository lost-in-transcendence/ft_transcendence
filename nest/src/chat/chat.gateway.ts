import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
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
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { ChannelsService } from 'src/chat/channels/channels.service';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateChatDto } from './dto';
import { GetUserWs } from 'src/users/decorator/get-user-ws';
import { CreateMessageDto } from './messages/dto';
import { WsValidationPipe } from '../websocket-server/pipes';
import { MessagesService } from './messages/messages.service';

@UseFilters(new BaseWsExceptionFilter())
@UsePipes(new WsValidationPipe({whitelist: true}))
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

	afterInit()
	{
		this.logger.log('Chat Gateway initialized');
	}

	handleConnection(client: Socket, @GetUserWs() user: User)
	{
		this.logger.log(`Client ${client.data.user.userName} connected to chat server`);
	}

	handleDisconnect(client: Socket)
	{
		const user: User = client.data.user;
		this.logger.log(`Client ${user.userName} disconnected from chat server`);
	}

	@SubscribeMessage('message')
	async sendMessage(@MessageBody() dto: CreateMessageDto)
	{
		this.logger.debug('in message event', {dto});
		const newMessage = await this.messageService.create(dto);
		this.logger.debug({newMessage});
		// this.server.emit('message', text);
	}

	/*************************/
	/*        TESTING        */
	/*************************/
	@SubscribeMessage('test')
	test()
	{
		this.logger.debug('DEBUG');
		this.logger.error('ERROR');
		this.logger.log('LOG');
		this.logger.verbose('VERBOSE');
		this.logger.warn('WARN');
	}
	/******************************************************************************************/

	@SubscribeMessage('joinRoom')
	join(@MessageBody('channel') channel: string, @ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		this.logger.log(`client: ${user.userName} has joined channel ${channel}`);
		this.logger.debug({user});
		client.join(channel);
	}

	@SubscribeMessage('toRoom')
	toRoom(@MessageBody() body: CreateChatDto, @ConnectedSocket() client: Socket)
	{
		console.log('in toRoom', { body });
		client.to(body.channel).emit('message', body);
	}

	@SubscribeMessage('findOneChat')
	findOne(@MessageBody() id: number)
	{
		return this.chatService.findOne(id);
	}

	@SubscribeMessage('updateChat')
	update(@MessageBody() updateChatDto: UpdateChatDto)
	{
		return this.chatService.update(updateChatDto.id, updateChatDto);
	}

	@SubscribeMessage('removeChat')
	remove(@MessageBody() id: number)
	{
		return this.chatService.remove(id);
	}
}
