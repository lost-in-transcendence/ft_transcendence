import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { FullAuthGuard } from "src/auth/guard/full-auth.guard";
import { GamesService } from "./game.service";

@UseGuards(FullAuthGuard)
@Controller('games')
export class GamesController
{
    constructor(private readonly gamesService: GamesService) {}

    @Post('ongoing')
    @HttpCode(200)
    async getOngoing(@Body('userName') userName: string)
    {
        const game = await this.gamesService.findFirst(
            {
                where:
                {
                    AND:
                    [
                        {players: {some: {player: {userName}}}},
                        {ongoing: true}
                    ]
                }
            });
        if (game === null)
            return {};
        return game;
    }
}