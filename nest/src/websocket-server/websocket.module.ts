import { Module } from "@nestjs/common";
import { ChannelsModule } from "src/chat/channels/channels.module";
import { PlayStatsService } from "src/playstats/playstats-service";
import { UsersModule } from "src/users/users.module";
import { MainGateway } from "./main.gateway";

@Module({
	providers: [MainGateway, PlayStatsService],
	imports: [UsersModule, ChannelsModule]
})
export class WebsocketModule {}
