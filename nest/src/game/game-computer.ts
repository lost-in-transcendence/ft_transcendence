import { Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { Socket, Namespace } from 'socket.io';
import { GlobalChatService } from 'src/global/global-chat-service';
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

enum GameStatusValue
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
    speed: number;
    size: number;
    constructor(position : any, direction: any,  size: any)
    {
        this.position = position;
        this.direction = direction;
        this.speed = 3;
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
        this.speed = 10;
        this.size = size;
    }
    updatePosition()
    {
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

    scoreObjective: number;
    timer: number;

    objective: Objective;

    paddle1: Paddle;
    paddle2: Paddle;
    
    ball: any;

    winner: number;

    status: GameStatusValue = GameStatusValue.WAITING;
    endGame: EndGameValue = EndGameValue.ONGOING;
    disconnectedSocket: string;
    // spectators: User[];

    constructor(params: {id: string, user1: User, user2: User, user1SocketId: string, user2SocketId: string, objective: Objective, scoreObjective: number, timer: number})
    {
        const {id, user1, user2, user1SocketId, user2SocketId, objective, scoreObjective, timer} = params;
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.user1SocketId = user1SocketId;
        this.user2SocketId = user2SocketId;
        this.paddle1 = new Paddle(Math.round((height / 2) - 50), 100);
        this.paddle2 = new Paddle(Math.round((height / 2) - 50), 100);
        this.ball = new Ball({x: width / 2, y:height / 2}, {x: 1, y:1}, 25);
        this.objective = objective;
        this.scoreObjective = scoreObjective;
        this.timer = timer;
        this.winner = 0;

        // TODO
        // - do spectators and shit

        // this.spectators = [];
    }
}

@Injectable()
export class GameComputer
{
    private ongoingGames: OngoingGame[] = []
    private server: Namespace;

    private readonly logger = new Logger(GameComputer.name);

    constructor (server: Namespace, private readonly gamesService: GamesService)
    {
        this.server = server;
    }

    async newGame(gameId: string, waitingRoom: GameWaitingRoom, objective: Objective, scoreObjective: number, timer: number)
    {
        const {user1, user2, user1SocketId, user2SocketId} = waitingRoom;
        const game = new OngoingGame(
            {
                id: gameId, 
                user1,
                user2,
                user1SocketId,
                user2SocketId,
                objective,
                scoreObjective,
                timer,
            });
        this.ongoingGames.push(game);
        this.runGame(game);
        return game;
    }

    async paddleMove(userSocketId: string, user: User, direction: PaddleDirection)
    {
        const game = await this.findGameBySocketId(userSocketId);
        if (game)
        {
            const isPlayer = this.isAPlayer(game, user, userSocketId);
            if (isPlayer === 1)
            {
                game.paddle1.direction = direction;
            }
            else if (isPlayer === 2)
            {
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
            if (game.ball.position.y <= paddle.position + paddle.size / 3)
            {
                game.ball.direction.y = -1;
            }
            else if (game.ball.position.y >= paddle.position + paddle.size - paddle.size / 3)
            {
                game.ball.direction.y = 1;
            }
            else
            {
                game.ball.direction.y = 0;
            }
        }
        else
        {
            game.ball.position.x = width / 2;
            game.ball.position.y = height / 2;
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
                if (game.score1 === game.scoreObjective)
                    game.winner = 1;
                else if (game.score2 === game.scoreObjective)
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
        game.ball.position.x = game.ball.position.x + (game.ball.speed * game.ball.direction.x);
        if (game.ball.position.x < 0 + game.ball.size / 2)
        {
            this.handleBounces(game, game.paddle1, 1);
        }
        else if (game.ball.position.x > width - game.ball.size / 2)
        {
            this.handleBounces(game, game.paddle2, 2);
        }
        game.ball.position.y = game.ball.position.y + (game.ball.speed * game.ball.direction.y);
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
            this.server.to(game.id).emit('matchDeclinedByOpponent');
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
        // enregistrer les scores
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
        if (game.winner === 0)
        {
            // do something
            this.server.to(game.id).emit('endGame'),
            {
                draw: true,
            }
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
    }

    async runGame(game: OngoingGame)
    {
        //setup

        const timerId = setInterval(() =>
        {
            //check game status etc
            if (game.endGame !== EndGameValue.ONGOING)
            {
                this.endGame(game);
                clearInterval(timerId);
                this.deleteGame(game.id);
            }
            if (game.status === GameStatusValue.ONGOING)
            {
                game.paddle1?.updatePosition();
                game.paddle2?.updatePosition();
                this.updateBallPosition(game);
                if (game.objective === Objective.TIME)
                {
                    game.timer -= 16;
                    if (game.timer <= 0)
                    {
                        game.endGame = EndGameValue.TIME;
                        game.status = GameStatusValue.FINISHED;
                        if (game.score1 > game.score2)
                            game.winner = 1;
                        else if (game.score2 > game.score1)
                            game.winner = 2;
                    }
                }
                this.server.to(game.id).emit('renderFrame', 
                {
                    paddle1Pos: game.paddle1.position,
                    paddle2Pos: game.paddle2.position,
                    ballPos: game.ball.position,
                    player1Score: game.score1,
                    player2Score: game.score2,
                });
            }
            //render le jeu et tout
        }, 16
        );
    }

    async deleteGame(gameId: string)
    {
        const game = this.ongoingGames.find((v) => {return v.id === gameId});
        if (game)
        {
            this.ongoingGames = this.ongoingGames.filter((v) => v.id !== gameId);
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

    async userJoin(gameId: string, user: User, userSocketId: string)
    {
        const game = await this.findGame(gameId);
        if (!game)
        {
            throw new Error("Could not find corresponding game");
        }
        const isPlayer = this.isAPlayer(game, user, userSocketId);
        if (isPlayer)
        {
            if (isPlayer === 1)
                game.readyPlayer1 = true;
            else if (isPlayer === 2)
                game.readyPlayer2 = true;
        }
        // else
        // {
        //     game.spectators.push(user);
        // }
        if (game.readyPlayer1 === true && game.readyPlayer2 === true)
        {
            this.server.to(game.id).emit('startGame');
            game.status = GameStatusValue.ONGOING;
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
                game.disconnectedSocket = userSocketId;
            }
        }
    }

    isAPlayer(game: OngoingGame, user: User, userSocketId: string)
    {
        const {user1, user2, user1SocketId, user2SocketId} = game;
        if (user1.id === user.id && user1SocketId === userSocketId)
            return 1;
        else if (user2.id === user.id && user2SocketId === userSocketId)
            return 2;
        return 0;
    }

    async startGame()
    {

    }


}