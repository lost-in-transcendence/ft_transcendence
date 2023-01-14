import { Controller, Get, HttpCode, UseGuards } from "@nestjs/common";
import { FullAuthGuard } from "src/auth/guard/full-auth.guard";
import { PlayStatsService } from "./playstats-service";

@Controller('ranks')
export class PlayStatsController
{
    constructor(private readonly playStatsService: PlayStatsService) {}

    @UseGuards(FullAuthGuard)
    @Get('get-leaderboard')
    @HttpCode(200)
    async getLeaderBoard()
    {
        const ret = await this.playStatsService.findMany(
            {
                orderBy: {rank: 'asc'},
                include: 
                {
                    user: 
                    {
                        select:
                        {
                            userName: true
                        }
                    }
                }
            });
        return (ret);
    }
    
}