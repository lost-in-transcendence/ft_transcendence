import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelGateway } from './channel.gateway';

@Module({
	controllers: [ChannelsController],
	providers: [ChannelsService, ChannelGateway],
	exports: [ChannelsService]
})
export class ChannelsModule { }
