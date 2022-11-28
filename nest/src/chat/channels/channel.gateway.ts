import { ParseIntPipe, ParseUUIDPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Namespace, Server, Socket} from 'socket.io';
import { GetUserWs } from "src/users/decorator/get-user-ws";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto } from "./dto";

@WebSocketGateway({cors: true, namespace: 'chat'})
export class ChannelGateway
{
	constructor(private readonly channelService: ChannelsService) {}

	@WebSocketServer()
	server: Namespace;

	@SubscribeMessage('createChannel')
	createChannel(@MessageBody() dto: CreateChannelDto, @GetUserWs('id', ParseUUIDPipe) id: string, @ConnectedSocket() client: Socket)
	{
		this.channelService.create(dto, id);
		client.join(dto.channelName);
	}
}
