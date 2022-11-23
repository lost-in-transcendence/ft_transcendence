import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChannelsModule } from 'src/chat/channels/channels.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { env } from 'process';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [ChannelsModule, JwtModule.register({
	secret: env.JWT_SECRET
  })]
})
export class ChatModule {}
