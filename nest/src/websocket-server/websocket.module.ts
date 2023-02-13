import { Module } from "@nestjs/common";
import { ChannelsGateway } from "src/chat/channels/channels.gateway";
import { ChannelsModule } from "src/chat/channels/channels.module";
import { PlayStatsService } from "src/playstats/playstats-service";
import { UsersModule } from "src/users/users.module";
import { CleanupModule } from "./cleanup.module";
import { CleanupService } from "./cleanup.service";
import { MainGateway } from "./main.gateway";

@Module({
	providers: [MainGateway, PlayStatsService],
	imports: [UsersModule, ChannelsModule, CleanupModule]
})
export class WebsocketModule {}
