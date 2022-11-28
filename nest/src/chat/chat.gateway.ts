import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
	OnGatewayConnection,
	WsException,
	OnGatewayDisconnect,
	OnGatewayInit
} from '@nestjs/websockets';
import { Socket, Namespace } from 'socket.io';
import { Channel, RoleType, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { ChannelsService } from 'src/chat/channels/channels.service';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateChatDto } from './dto';
import { GetUserWs } from 'src/users/decorator/get-user-ws';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './messages/dto';
import { WsValidationPipe } from '../websocket-server/pipes';
import { ChannelDto } from './channels/dto/channel-dto';
import { CreateUserDto } from 'src/users/dto';
import { joinChannelDto } from './channels/dto/join-channel.dto';

@UsePipes(new WsValidationPipe({whitelist: true}))
@WebSocketGateway({ cors: true, namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	private readonly logger = new Logger(ChatGateway.name);

	constructor(
		private readonly chatService: ChatService,
		private readonly channelService: ChannelsService,
		private readonly jwt: JwtService,
		private readonly prisma: PrismaService) { }

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
	sendMessage(@MessageBody('text') text: string)
	{
		console.log("args", { text });
		console.log(`sending text: ${text}`);
		this.server.emit('message', text);
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
	join(@MessageBody('channelName') channelName: string, @ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
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
