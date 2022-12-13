import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GamesService } from './game.service';

@Module(
    {
        providers: [GameGateway, GamesService],
    })
export class GameModule {}
