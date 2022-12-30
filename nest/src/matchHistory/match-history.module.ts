import { Module } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { MatchHistoryController } from "./match-history.controller";
import { MatchHistoryService } from "./match-history.service";

@Module({
    controllers: [MatchHistoryController],
    providers: [MatchHistoryService, UsersService]
})
export class MatchHistoryModule {}