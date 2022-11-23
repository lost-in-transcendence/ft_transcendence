import { Logger } from '@nestjs/common';
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
import { Server, Socket, Namespace } from 'socket.io';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';

import { ChannelsService } from 'src/channels/channels.service';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';
import { CreateChatDto } from './dto';
import { GetUserWs } from 'src/users/decorator/get-user-ws';
import { PrismaService } from 'src/prisma/prisma.service';

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

	async handleConnection(client: Socket)
	{
		this.logger.log('in connection');
		// try
		// {
		// 	const token = client.handshake.headers.authorization.split(' ')[1];
		// 	const ret = this.jwt.verify(token, { secret: env.JWT_SECRET });
		// 	const user: User = await this.prisma.user.findUnique({ where: { id: ret.id } });
		// 	// console.log({ret});
		// 	client.data.user = user;
		// 	// console.log(client.data.user);
		// }
		// catch (err)
		// {
		// 	this.logger.error('oki', {err});
		// 	client.disconnect();
		// }
	}

	handleDisconnect(client: Socket)
	{
		console.log('lol', client.data.user);
		console.log('disco');
	}

	@SubscribeMessage('message')
	sendMessage(@MessageBody('text') text: string)
	{
		console.log("args", { text });
		console.log(`sending text: ${text}`);
		this.server.emit('message', text);
	}

	@SubscribeMessage('joinRoom')
	join(@MessageBody('channel') channel: string, @ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		console.log(`client: ${client.id} join room ${channel}`, { user });
		client.join(channel);
		throw new WsException('test exception');
		console.log(`client rooms :`, client.rooms.keys());
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
