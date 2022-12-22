import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChannelsModule } from 'src/chat/channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { ChannelMemberModule } from './channels/channel-member/channel-member.module';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [
	ChannelsModule,
	MessagesModule,
	ChannelMemberModule,
	JwtModule.register({
	secret: env.JWT_SECRET
  }),]
})
export class ChatModule {}
