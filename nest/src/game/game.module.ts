import { Module } from '@nestjs/common';
import { GameComputer } from './game-computer';
import { GameGateway } from './game.gateway';
import { GamesService } from './game.service';

@Module(
    {
        providers: [GameGateway, GamesService, GameComputer],
    })
export class GameModule {}
