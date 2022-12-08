import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { UsersService } from "src/users/users.service";
import { MainGateway } from "./main.gateway";

@Module({
	providers: [MainGateway],
	imports: [UsersModule]
})
export class WebsocketModule {}
