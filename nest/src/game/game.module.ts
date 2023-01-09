import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { GameComputer } from './game-computer';
import { GameGateway } from './game.gateway';
import { GamesService } from './game.service';

@Module(
    {
        providers: [GameGateway, GamesService, GameComputer, UsersService],
    })
export class GameModule {}
