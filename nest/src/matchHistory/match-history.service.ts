// skip generic functions

import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MatchHistoryService
{
    constructor(private readonly prisma: PrismaService)
    {

    }

    async getUserMatchHistory(userId: string)
    {
        const ret = await this.prisma.user.findUnique(
            {
                where: {id: userId},
                select: {userName: true, matchHistory: true}
            })
        const playerGames = ret.matchHistory;
        console.log(playerGames);
        const matchHistory = await Promise.all(playerGames.map(async (v) =>
        {
            const opp = await this.prisma.playerGame.findFirst(
                {
                    where: {
                        AND: {gameId: v.gameId},
                        NOT: {playerId: userId}
                    },
                    select:
                    {
                        playerId: true,
                        score: true,
                        player: 
                        {
                            select: {userName: true}
                        }
                    }
                }
            );
            if (!opp)
            {
                console.log("NULL");
                return;
            }
            return {
                gameId: v.gameId,
                player1:
                {
                    id: userId,
                    userName: ret.userName,
                    score: v.score
                },
                player2:
                {
                    id: opp.playerId,
                    userName: opp.player.userName,
                    score: opp.score,
                }
            }
        }))
        return matchHistory;
    }
}