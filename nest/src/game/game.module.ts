import { Module } from '@nestjs/common';
import { PlayStatsService } from 'src/playstats/playstats-service';
import { UsersService } from 'src/users/users.service';
import { CleanupModule } from 'src/websocket-server/cleanup.module';
import { CleanupService } from 'src/websocket-server/cleanup.service';
import { GameComputer } from './game-computer';
import { GamesController } from './game-controller';
import { GameGateway } from './game.gateway';
import { GamesService } from './game.service';

@Module(
    {
        providers: [GameGateway, GamesService, GameComputer, UsersService, PlayStatsService],
        imports: [CleanupModule],
        controllers: [GamesController]
    })
export class GameModule {}
