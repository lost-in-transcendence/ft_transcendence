import { Module } from '@nestjs/common';

import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { UsersModule } from 'src/users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { ChannelMemberModule } from './channel-member/channel-member.module';
import { CleanupModule } from 'src/websocket-server/cleanup.module';

@Module({
	controllers: [ChannelsController],
	providers: [ChannelsService, ChannelsGateway],
	exports: [ChannelsService],
	imports: [UsersModule, MessagesModule, ChannelMemberModule, CleanupModule]
})
export class ChannelsModule { }
