import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { UsersModule } from 'src/users/users.module';

@Module({
	controllers: [ChannelsController],
	providers: [ChannelsService, ChannelsGateway],
	exports: [ChannelsService],
	imports: [UsersModule]
})
export class ChannelsModule { }
