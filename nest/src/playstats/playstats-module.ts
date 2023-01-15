import { Module } from "@nestjs/common";
import { PlayStatsController } from "./playstats-controller";
import { PlayStatsService } from "./playstats-service";

@Module({
    controllers: [PlayStatsController],
    providers: [PlayStatsService]
  })
  export class PlayStatsModule {}