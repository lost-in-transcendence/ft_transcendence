import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';

@Module({
	controllers: [ChannelsController],
	providers: [ChannelsService, ChannelsGateway],
	exports: [ChannelsService]
})
export class ChannelsModule { }
