import { Module } from '@nestjs/common';
import { ChannelMemberService } from './channel-member.service';

@Module({
	providers: [ChannelMemberService],
	exports: [ChannelMemberService]
})
export class ChannelMemberModule {}
