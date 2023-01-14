import { ForbiddenException, HttpException, Injectable, Logger, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { User } from '@prisma/client';
import { Socket, Namespace } from 'socket.io';
import { GameWaitingRoom } from './game.gateway';
import { GamesService } from './game.service';

const width: number = 800;
const height: number = 600;

enum EndGameValue
{
    ONGOING,
    ABORTED,
    DISCONNECTION,
    SCORE,
    TIME,
}

export enum GameStatusValue
{
    WAITING,
    ONGOING,
    FINISHED,
}

export enum Objective
{
    TIME,
    SCORE,
}

export enum PaddleDirection
{
    UP = -1,
    IDLE,
    DOWN,
}

class Ball
{
    position: {x: number, y: number};
    direction: {x:number, y: number};
    speed: { x: number, y : number};
    size: number;
    constructor(position : any, direction: any,  size: any)
    {
        this.position = position;
        this.direction = direction;
        this.speed = {x: 3, y: 3};
        this.size = size;
    }
}

class Paddle 
{
    position: number;
    direction: PaddleDirection;
    speed: number;
    size: number;
    constructor(position, size)
    {
        this.position = position;
        this.direction = PaddleDirection.IDLE;
        this.speed = 0;
        this.size = size;
    }
    updatePosition()
    {
        if (this.direction === PaddleDirection.IDLE)
            this.speed = 0;
        else
            this.speed += 0.5;
        if (this.speed > 25)
            this.speed = 25;
        this.position = this.position + (this.speed * this.direction);
        if (this.position < 0)
        {
            this.position = 0;
        }
        else if (this.position > height - this.size)
        {
            this.position = height - this.size;
        }
    }
}

interface Spectator 
{
    id: string;
    name: string;
    socketId: string;

}

class OngoingGame
{
    id: string;
    user1: User;
    user2: User;

    readyPlayer1: boolean = false;
    readyPlayer2: boolean = false;

    user1SocketId: string;
    user2SocketId: string;
    
    score1: number = 0;
    score2: number = 0;

    // scoreObjective: number;
    timer?: number;
    goal: number;
    objective: Objective;
    theme: string;

    paddle1: Paddle;
    paddle2: Paddle;
    
    ball: any;

    winner: number;

    status: GameStatusValue = GameStatusValue.WAITING;
    endGame: EndGameValue = EndGameValue.ONGOING;
    disconnectedSocket: string;
    spectators: Spectator[] = [];

    constructor(params: {id: string, user1: User, user2: User, user1SocketId: string, user2SocketId: string, objective: Objective, goal: number, theme: string})
    {
        const {id, user1, user2, user1SocketId, user2SocketId, objective, goal, theme} = params;
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.user1SocketId = user1SocketId;
        this.user2SocketId = user2SocketId;
        this.paddle1 = new Paddle(Math.round((height / 2) - 50), 100);
        this.paddle2 = new Paddle(Math.round((height / 2) - 50), 100);
        this.ball = new Ball({x: width / 2, y:height / 2}, {x: 1, y:1}, 25);
        this.objective = objective;
        this.goal = goal;
        this.theme = theme;
        this.winner = 0;
        if (this.objective === Objective.TIME)
        {
            this.timer = this.goal * 1000 * 60;
        }
    }
}

@Injectable()
export class GameComputer
{
    private ongoingGames: OngoingGame[] = []
    private server?: Namespace;

    private readonly logger = new Logger(GameComputer.name);

    constructor (private readonly gamesService: GamesService) {}

    initServer(server: Namespace)
    {
        this.server = server;
    }

    async newGame(waitingRoom: GameWaitingRoom)
    {
        const {id, user1, user2, objective, goal, theme, user1SocketId, user2SocketId} = waitingRoom;
        const game = new OngoingGame(
            {
                id, 
                user1,
                user2,
                user1SocketId,
                user2SocketId,
                objective,
                goal,
                theme,
            });
        this.ongoingGames.push(game);
        this.runGame(game);
        return game;
    }

    async paddleMove(userSocketId: string, direction: PaddleDirection)
    {
        const game = await this.findGameBySocketId(userSocketId);
        if (game)
        {
            const isPlayer = this.isAPlayer(game, userSocketId);
            if (isPlayer === 1)
            {
                // if (game.paddle1.speed === 0)
                //     game.paddle1.speed = 5;
                // else
                //     game.paddle1.speed += 2.5;
                // if (game.paddle1.speed > 30)
                //     game.paddle1.speed = 30;
                // if (direction === PaddleDirection.IDLE)
                //     game.paddle1.speed = 0;
                // this.logger.debug(`paddle 1 speed = ${game.paddle1.speed}`);
                game.paddle1.direction = direction;
            }
            else if (isPlayer === 2)
            {
                // if (game.paddle2.speed === 0)
                //     game.paddle2.speed = 5;
                // else
                //     game.paddle2.speed += 2.5;
                // if (game.paddle2.speed > 30)
                //     game.paddle2.speed = 30;
                // if (direction === PaddleDirection.IDLE)
                //     game.paddle2.speed = 0;
                // this.logger.debug(`paddle 2 speed = ${game.paddle2.speed}`);
                game.paddle2.direction = direction;
            }
        }
    }

    async handleBounces(game: OngoingGame, paddle : Paddle, player: number)
    {
        const ballTop = game.ball.position.y - (game.ball.size / 2);
        const ballDown = game.ball.position.y + (game.ball.size / 2)
        if (ballDown >= paddle.position && ballTop <= paddle.position + paddle.size)
        {
            if (player === 1)
                game.ball.position.x = game.ball.size;
            else
                game.ball.position.x = width - game.ball.size;
            game.ball.direction.x *= -1;
            // if (game.ball.position.y <= paddle.position + paddle.size / 3)
            // {
            //     game.ball.direction.y = -1;
            // }
            // else if (game.ball.position.y >= paddle.position + paddle.size - paddle.size / 3)
            // {
            //     game.ball.direction.y = 1;
            // }
            // else
            // {
            //     game.ball.direction.y = 0;
            // }
            const paddleHalf = paddle.size / 2;
            const paddleCenter = paddle.position + paddleHalf;
            const distToPaddle = game.ball.position.y - paddleCenter;
            const paddleRatio = (distToPaddle / paddleHalf);
            game.ball.speed.y += ((paddleRatio < 0 ? -paddleRatio : paddleRatio) - 0.1) + (paddle.speed / 12.5);
            if (game.ball.speed.y < 1)
                game.ball.speed.y = 1;
            else if (game.ball.speed.y > 25)
                game.ball.speed.y = 25;
            game.ball.direction.y = paddleRatio;
            this.logger.debug(`ball hit paddle, speedY = ${game.ball.speed.y}`);
        }
        else
        {
            game.ball.position.x = width / 2;
            game.ball.position.y = height / 2;
            game.ball.speed.y = 3;
            if (player === 1)
            {
                game.score2++;
            }
            else
            {
                game.score1++;
            }
            if (game.objective === Objective.SCORE)
            {
                if (game.score1 === game.goal)
                    game.winner = 1;
                else if (game.score2 === game.goal)
                    game.winner = 2;
                else
                    return ;
                game.endGame = EndGameValue.SCORE;
                game.status = GameStatusValue.FINISHED;
            }
        }
    }

    async updateBallPosition(game: OngoingGame)
    {
        game.ball.position.x = game.ball.position.x + (game.ball.speed.x * game.ball.direction.x);
        if (game.ball.position.x < 0 + game.ball.size / 2)
        {
            this.handleBounces(game, game.paddle1, 1);
        }
        else if (game.ball.position.x > width - game.ball.size / 2)
        {
            this.handleBounces(game, game.paddle2, 2);
        }
        game.ball.position.y = game.ball.position.y + (game.ball.speed.y * game.ball.direction.y);
        if (game.ball.position.y < game.ball.size / 2)
        {
            game.ball.direction.y *= -1;
            game.ball.position.y = game.ball.size / 2;
        }
        if (game.ball.position.y > height - game.ball.size / 2)
        {
            game.ball.direction.y *= -1;
            game.ball.position.y = height - game.ball.size / 2;
        }
    }

    async endGame(game: OngoingGame)
    {
        if (game.endGame === EndGameValue.ABORTED)
        {
            const player = this.isAPlayer(game, game.disconnectedSocket);
            if (player === 1)
                this.server.to(game.user2SocketId).emit('matchDeclinedByOpponent');
            else if (player === 2)
                this.server.to(game.user1SocketId).emit('matchDeclinedByOpponent')
            this.gamesService.remove({where: {id: game.id}})
            return ;
        }
        else if (game.endGame === EndGameValue.DISCONNECTION)
        {
            if (game.disconnectedSocket === game.user1SocketId)
            {
                game.score2 = 3;
                game.score1 = 0;
                game.winner = 2;
            }
            else
            {
                game.score1 = 3;
                game.score2 = 0;
                game.winner = 1;
            }
            game.status = GameStatusValue.FINISHED;
        }
        this.gamesService.update({where: {id: game.id}, data: 
            {
                players:
                {
                    update:
                    [
                        {
                            where: {playerId_gameId: {playerId: game.user1.id, gameId: game.id}},
                            data: {score: game.score1},
                        },
                        {
                            where: {playerId_gameId: {playerId: game.user2.id, gameId: game.id}},
                            data: {score: game.score2},
                        },
                    ]
                }
            }});
        if (game.endGame === EndGameValue.TIME && game.score1 === game.score2)
        {
            this.server.to(game.id).emit('endGame',
            {
                draw: true,
            });
            this.server.socketsLeave(game.id);
            return;
        }

        let winnerName, loserName;
        if (game.winner === 1)
        {
            winnerName = game.user1.userName;
            loserName = game.user2.userName;
        }
        else
        {
            winnerName = game.user2.userName;
            loserName = game.user1.userName;
        }

        this.server.to(game.id).emit('endGame', 
        {
            winner: winnerName,
            loser: loserName,
            reason: game.disconnectedSocket ? `${loserName} disconnected.` : ''
        })
        this.server.socketsLeave(game.id);
    }

    async runGame(game: OngoingGame)
    {
        //setup

        const timerId = setInterval(() =>
        {
            //check game status etc
            if (game.endGame !== EndGameValue.ONGOING)
            {
                clearInterval(timerId);
                this.endGame(game);
                this.deleteGame(game.id);
            }
            if (game.status === GameStatusValue.ONGOING)
            {
                game.paddle1?.updatePosition();
                game.paddle2?.updatePosition();
                this.updateBallPosition(game);
                
                this.server.to(game.id).emit('renderFrame', 
                {
                    paddle1Pos: game.paddle1.position,
                    paddle2Pos: game.paddle2.position,
                    ballPos: game.ball.position,
                    player1Score: game.score1,
                    player2Score: game.score2,
                });
            }
        }, 16
        );
        const timerId2 = setInterval(() =>
        {
            if (game.status === GameStatusValue.ONGOING && game.objective === Objective.TIME)
                {
                    if (Date.now() >= game.timer)
                    {
                        game.endGame = EndGameValue.TIME;
                        game.status = GameStatusValue.FINISHED;
                        if (game.score1 > game.score2)
                            game.winner = 1;
                        else if (game.score2 > game.score1)
                            game.winner = 2;
                        clearInterval(timerId2);
                    }
                }
        }, 250);
    }

    async deleteGame(gameId: string)
    {
        const game = this.ongoingGames.find((v) => {return v.id === gameId});
        if (game)
        {
            this.ongoingGames = this.ongoingGames.filter((v) => v.id !== gameId);
            if (game.endGame !== EndGameValue.ABORTED)
                this.emitOngoingGames();
            return true;
        }
        return false;
    }

    async findGame(gameId: string)
    {
        return this.ongoingGames.find((v) => {return v.id === gameId});
    }

    async findGameBySocketId(socketId: string)
    {
        return this.ongoingGames.find((v) => {return v.user1SocketId === socketId || v.user2SocketId === socketId})
    }

    async findGameBySpectatorSocketId(socketId: string)
    {
        return this.ongoingGames.find((v) =>
        {
            return v.spectators.find((val) =>
            {
                return val.socketId === socketId;
            });
        })
    }

    async userJoin(gameId: string, user: User, userSocketId: string)
    {
        const game = await this.findGame(gameId);
        if (!game)
        {
            this.server.to(userSocketId).emit('exception', {status: 400, message: "Couldnt find corresonding game"});
            return false;
        }
        const isPlayer = this.isAPlayer(game, userSocketId);
        if (isPlayer)
        {
            if (isPlayer === 1)
                game.readyPlayer1 = true;
            else if (isPlayer === 2)
                game.readyPlayer2 = true;
        }
        else
        {
            game.spectators.push({id: user.id, name: user.userName, socketId: userSocketId});
        }
        if (game.readyPlayer1 === true && game.readyPlayer2 === true && game.status !== GameStatusValue.ONGOING)
        {
            this.server.to(game.id).emit('startGame');
            game.timer = Date.now() + game.goal * 60 * 1000;
            game.status = GameStatusValue.ONGOING;
            this.emitOngoingGames();
        }
    }

    async playerDisconnected(userSocketId: string)
    {
        const game = await this.findGameBySocketId(userSocketId);
        if (!game)
            return false;
        if (game.endGame === EndGameValue.ONGOING)
        {
            if (game.status === GameStatusValue.WAITING)
            {
                game.endGame = EndGameValue.ABORTED;
            }
            else
            {
                game.endGame = EndGameValue.DISCONNECTION;
            }
            game.disconnectedSocket = userSocketId;

        }
    }

    async spectatorDisconnected(game: OngoingGame, socketId: string)
    {
        game.spectators = game.spectators.filter((v) => v.socketId !== socketId);
    }

    isAPlayer(game: OngoingGame, userSocketId: string)
    {
        const {user1SocketId, user2SocketId} = game;
        if (user1SocketId === userSocketId)
            return 1;
        else if (user2SocketId === userSocketId)
            return 2;
        return 0;
    }

    async startGame()
    {

    }

    getOngoingGames()
    {
        const ongoingGames = []
        for ( let room of this.ongoingGames)
        {
            if (room.status !== GameStatusValue.ONGOING)
                continue;
            ongoingGames.push(
                {
                    id : room.id,
                    objective: room.objective,
                    goal: room.goal,
                    user1: room.user1.userName,
                    user2: room.user2.userName,
                }
            );
        }
        return ongoingGames;
    }

    emitOngoingGames()
    {
        this.server.emit('ongoingGames', {ongoingGames: this.getOngoingGames()});
    }


}