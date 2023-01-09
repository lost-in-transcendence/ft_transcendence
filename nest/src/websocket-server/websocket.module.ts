import { Module } from "@nestjs/common";
import { ChannelsModule } from "src/chat/channels/channels.module";
import { UsersModule } from "src/users/users.module";
import { MainGateway } from "./main.gateway";

@Module({
	providers: [MainGateway],
	imports: [UsersModule, ChannelsModule]
})
export class WebsocketModule {}
