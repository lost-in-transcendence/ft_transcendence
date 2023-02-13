import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChannelsModule } from 'src/chat/channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { ChannelMemberModule } from './channels/channel-member/channel-member.module';
import { WebsocketModule } from 'src/websocket-server/websocket.module';
import { CleanupModule } from 'src/websocket-server/cleanup.module';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [
	ChannelsModule,
	MessagesModule,
	ChannelMemberModule,
	CleanupModule,
	JwtModule.register({
	secret: env.JWT_SECRET
  }),]
})
export class ChatModule {}
