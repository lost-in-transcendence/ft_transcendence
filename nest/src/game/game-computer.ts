import { ConsoleLogger, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { timeStamp } from 'console';
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

enum GameStatusValue
{
    WAITING,
    ONGOING,
    FINISHED,
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
    updatePosition()
    {
        this.position.x = this.position.x + (this.speed * this.direction.x);
        if (this.position.x < 0 + this.size / 2)
        {
            this.position.x = this.size / 2;
        }
        else if (this.position.x > width - this.size / 2)
        {
            this.position.x = width - this.size / 2;
        }

        this.position.y = this.position.y + (this.speed * this.direction.y);
        if (this.position.y < 0 + this.size / 2)
        {
            this.position.y = this.size / 2;
        }
        else if (this.position.y > height - this.size / 2)
        {
            this.position.y = height - this.size / 2;
        }
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
        this.speed = 1;
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
    
    score1: number;
    score2: number;

    paddle1: Paddle;
    paddle2: Paddle;
    
    ball: any;


    status: GameStatusValue = GameStatusValue.WAITING;
    endGame: EndGameValue = EndGameValue.ONGOING;
    disconnectedSocket: string;
    // spectators: User[];

    constructor(params: {id, user1, user2, user1SocketId, user2SocketId})
    {
        const {id, user1, user2, user1SocketId, user2SocketId} = params;
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.user1SocketId = user1SocketId;
        this.user2SocketId = user2SocketId;
        this.paddle1 = new Paddle(Math.round((height / 2) - 50), 100);
        this.paddle1 = new Paddle(Math.round((height / 2) - 50), 100);
        this.ball = new Ball({x: width / 2, y:height / 2}, {x: 1, y:1}, 25);
        // TODO
        // - define score paddle ball base values

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

    async newGame(gameId: string, waitingRoom: GameWaitingRoom)
    {
        const {user1, user2, user1SocketId, user2SocketId} = waitingRoom;
        const game = new OngoingGame(
            {
                id: gameId, 
                user1,
                user2,
                user1SocketId,
                user2SocketId
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

    async runGame(game: OngoingGame)
    {
        //setup

        const timerId = setInterval(() =>
        {
            //check game status etc
            if (game.endGame !== EndGameValue.ONGOING)
            {
                if (game.endGame === EndGameValue.ABORTED)
                {
                    this.server.to(game.id).emit('aborted');
                    this.gamesService.remove({where: {id: game.id}});
                }
                else if (game.endGame === EndGameValue.DISCONNECTION)
                {
                    this.server.to(game.id).emit('disconnected');
                    if (game.disconnectedSocket === game.user1SocketId)
                    {
                        //user2 wins donc change le score BATARD
                    }
                    else
                    {
                        //user1 wins donc change le score sale petit CANCRE ouuuuuuuuuuuuuuuuuuuuuuuuuhhhhhhhhhhhhhhhhhhh yeah
                    }
                }
                // enregistrer les scores 
                clearInterval(timerId);
                this.deleteGame(game.id);
            }
            if (game.status === GameStatusValue.ONGOING)
            {
                game.paddle1.updatePosition();
                game.paddle2.updatePosition();
                game.ball.updatePosition();

                this.server.to(game.id).emit('renderFrame', {paddle1Pos: game.paddle1.position, paddle2Pos: game.paddle2.position, ballPos: game.ball.position});
            }
            //render le jeu et tout
        }, 1000);
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
        // console.log(`game computer userJoin : gameId=${gameId} user socket = ${userSocketId}`)
        // this.logger.debug(`gameId=${gameId} user socket = ${userSocketId}`);
        const game = await this.findGame(gameId);
        console.log("gameId:", gameId, "user.id:", user.id, "userSocketId:", userSocketId);
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
            // this.server.to(game.id).emit('joined', {user});
            // send message saying that you got into the game or something idk
        }
        // else
        // {
        //     game.spectators.push(user);
        // }
        if (game.readyPlayer1 === true && game.readyPlayer2 === true)
        {
            this.server.to(game.id).emit('startGame');
            game.status = GameStatusValue.ONGOING;
            // send message saying the game is fucking readYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYy
        }
        // console.log('P RDY = ',game.playersReady);
        // console.log("Player = ", user.id);
        // console.log("socket id = ", userSocketId)

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

    // async userLeave(user: User, userSocketId: string)
    // {
    //     const game = this.findGameBySocketId(userSocketId);
    //     if (game)
    //     {
    //         // emit un message a tous les gens dans la room pour dire qu'un mec s'est barre
    //         // si la game etait meme pas lancee faudrait supprimer la game peut etre
    //     }
    // }

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

    async endGame()
    {

    }


}