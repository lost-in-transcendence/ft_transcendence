import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { SocketAddress } from 'net';
import { Server, Socket } from 'socket.io';
import { text } from 'stream/consumers';

import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@WebSocketGateway({cors: true})
export class ChatGateway {
	constructor(private readonly chatService: ChatService) { }

	@WebSocketServer()
	server: Server;

	@SubscribeMessage('message')
	sendMessage(@MessageBody('text') text: string)
	{
		console.log("args", {text});
		console.log(`sending text: ${text}`);
		this.server.emit('message', text);
	}

	@SubscribeMessage('joinRoom')
	join(@MessageBody('channel') channel: string, @ConnectedSocket() client: Socket)
	{
		console.log(`client: ${client.id} join room ${channel}`);
		client.join(channel);
		console.log(`client rooms :`, client.rooms.keys());
	}

	@SubscribeMessage('toRoom')
	toRoom(@MessageBody() body: CreateChatDto, @ConnectedSocket() client: Socket)
	{
		console.log('in toRoom', {body});
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
