import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
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
<<<<<<< Updated upstream
import { Channel, RoleType } from '@prisma/client';
=======
>>>>>>> Stashed changes
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

@UseFilters(new BaseWsExceptionFilter())
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
		this.logger.debug('in message event', { dto });

		const newMessage: Message = await this.messageService.create(dto);
		this.server.emit('message', dto);
	}

	/*************************/
	/*        TESTING        */
	/*************************/
	@SubscribeMessage('test')
	async test(@MessageBody() body: {channelId: string, nb: number}, @ConnectedSocket() client: Socket)
	{
		this.logger.debug('in test event', {body});
		const test = await this.messageService.getMany(body.channelId, body.nb);
		this.server.to(client.id).emit('testMsg', test)
	}

	@SubscribeMessage('testMsg')
	testMsg(@MessageBody() body: any)
	{
		this.server.emit('testMsg', body);
	}
	/******************************************************************************************/

	@SubscribeMessage('joinRoom')
	join(@MessageBody('channelName') channelName: string, @ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
<<<<<<< Updated upstream
		const dto: joinChannelDto = {
			channelName: channelName,
			userId: user.id,
			role: 'MEMBER'
		}
		this.logger.log(`client: ${user.userName} has joined channel ${channelName}`);
		this.logger.debug({user});

		this.channelService.joinChannel(dto);
		this.server.to(channelName).emit('message', {text: `${user.userName} has joined ${channelName} ! Welcome ! lol`});
		client.join(channelName);
=======
		this.logger.log(`client: ${user.userName} has joined channel ${channel}`);
		this.logger.debug({ user });
		client.join(channel);
>>>>>>> Stashed changes
	}

	@SubscribeMessage('toRoom')
	toRoom(@MessageBody() body: any, @ConnectedSocket() client: Socket)
	{
		console.log('in toRoom', { body });
		this.logger.debug('sockets', this.server.sockets);
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
