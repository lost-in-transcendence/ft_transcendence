import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { UsersModule } from 'src/users/users.module';
import { ChannelMemberModule } from './channel-member/channel-member.module';

@Module({
	controllers: [ChannelsController],
	providers: [ChannelsService, ChannelsGateway],
	exports: [ChannelsService],
	imports: [UsersModule, ChannelMemberModule]
})
export class ChannelsModule { }
