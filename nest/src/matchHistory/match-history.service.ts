// skip generic functions

import { Injectable } from "@nestjs/common";
import { Game, PlayerGame, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MatchHistoryService
{
    constructor(private readonly prisma: PrismaService)
    {

    }

    async getUserMatchHistory(userId: string)
    {
        // const ret = await this.prisma.user.findUnique(
        //     {
        //         where: {id: userId},
        //         select: {userName: true, matchHistory: true}
        //     })
        const ret = await this.prisma.game.findMany(
            {
                where:
                {
                    players: {some: {playerId: userId}}
                },
                orderBy:
                {
                    playedAt: 'desc'
                },
                select:
                {
                    id: true,
                    players: 
                    {
                        select:
                        {
                            score: true,
                            playerId: true,
                            player: 
                            {
                                select:
                                {
                                    userName: true
                                }
                            }
                        }
                    }
                }
            }
        )
        const matchHistory = ret.map((v: {id: string, players: {score: number, playerId: string, player: User}[]}) =>
        {
            const {id, players} = v;
            if (players.length !== 2)
                return;
            let me, opp;
            if (players[0].playerId === userId)
            {
                me = players[0];
                opp = players[1];
            }
            else if (players[1].playerId === userId)
            {
                me = players[1];
                opp = players[0]
            }
            else
                return;
            return {
                        gameId: id,
                        player1:
                        {
                            id: me.playerId,
                            userName: me.player.userName,
                            score: me.score
                        },
                        player2:
                        {
                            id: opp.playerId,
                            userName: opp.player.userName,
                            score: opp.score,
                        }
                }
        })
        // console.log(playerGames);
        // const matchHistory = await Promise.all(playerGames.map(async (v) =>
        // {
        //     const opp = await this.prisma.playerGame.findFirst(
        //         {
        //             where: {
        //                 AND: {gameId: v.gameId},
        //                 NOT: {playerId: userId}
        //             },
        //             select:
        //             {
        //                 playerId: true,
        //                 score: true,
        //                 player: 
        //                 {
        //                     select: {userName: true}
        //                 }
        //             }
        //         }
        //     );
        //     if (!opp)
        //     {
        //         console.log("NULL");
        //         return;
        //     }
        //     return {
        //         gameId: v.gameId,
        //         player1:
        //         {
        //             id: userId,
        //             userName: ret.userName,
        //             score: v.score
        //         },
        //         player2:
        //         {
        //             id: opp.playerId,
        //             userName: opp.player.userName,
        //             score: opp.score,
        //         }
        //     }
        // }))
        return matchHistory;
    }
}