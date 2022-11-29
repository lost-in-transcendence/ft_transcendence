import { Logger, ParseIntPipe, ParseUUIDPipe, UseFilters, UsePipes } from "@nestjs/common";
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import {Namespace, Server, Socket} from 'socket.io';

import { GetUserWs } from "src/users/decorator/get-user-ws";
import { CustomWsFilter } from "src/websocket-server/filters";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto } from "./dto";

@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({cors: true, namespace: 'chat'})
export class ChannelsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger = new Logger(ChannelsGateway.name);

	constructor(private readonly channelService: ChannelsService) {}

	@WebSocketServer()
	server: Namespace;

	afterInit()
	{
		this.logger.debug('In ChannelGateway Init');
	}

	handleConnection(client: Socket)
	{
		this.logger.debug('In ChannelGateway Connect', `client ${client.id} connected`);
	}

	handleDisconnect(client: Socket)
	{
		this.logger.debug('In ChannelGateway Disconnect', `client ${client.id} disconnected`);
	}

	@SubscribeMessage('createChannel')
	async createChannel(@MessageBody() dto: CreateChannelDto, @GetUserWs('id', ParseUUIDPipe) id: string, @ConnectedSocket() client: Socket)
	{
			this.logger.warn('in create channel');
			await this.channelService.create(dto, id);
			client.join(dto.channelName);
	}
}
