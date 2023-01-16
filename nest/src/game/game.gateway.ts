import { ForbiddenException, Logger, ParseEnumPipe, UseFilters, UseInterceptors, UsePipes } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { env } from "process";
import { CustomWsFilter } from "src/websocket-server/filters";
import { UserInterceptor } from "src/websocket-server/interceptor";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { Socket, Namespace } from 'socket.io';
import { Game, GameStatusType, User } from '@prisma/client';
import { GetUserWs } from "src/users/decorator/get-user-ws";
import { GamesService } from "./game.service";
import { create } from "domain";
import { GetUser } from "src/users/decorator";
import { GameComputer, GameStatusValue, Objective, PaddleDirection } from "./game-computer";
import { Subscriber } from "rxjs";
import { userInfo } from "os";
import { IsEnum } from "class-validator";
import { UsersService } from "src/users/users.service";

export enum GameType
{
	QUICKPLAY = 0,
	CUSTOM
}

export class GameWaitingRoom
{
	id: string;
	user1: User;
	user1SocketId: string;
	user2?: User;
	user2SocketId?: string;
	invitation: boolean;
	invitedUser?: string;

    objective: Objective;
    goal: number;
    theme: string;

	type: GameType;


    constructor(params: {id: string, user1: User, user1SocketId: string, invitation: boolean, objective: Objective, goal: number, theme: string, type: GameType, user2?: User, user2SocketId?: string, invitedUser?: string}) {
        const {id, user1, user1SocketId, user2, user2SocketId, objective, goal, type, invitation, invitedUser, theme} = params;
        this.id = id;
        this.user1 = user1;
        this.user1SocketId = user1SocketId;
        this.user2 = user2;
        this.user2SocketId = user2SocketId;
        this.objective = objective;
        this.goal = goal;
        this.type = type;
        this.invitation = invitation;
        this.invitedUser = invitedUser;
        this.theme = theme;
    }
}

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`, namespace: 'game' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
	private readonly logger = new Logger(GameGateway.name);
	private waitingRooms: GameWaitingRoom[] = [];

	@WebSocketServer()
	server: Namespace;

	constructor(
		private readonly gamesService: GamesService,
		private readonly userService: UsersService,
		private readonly gameComputer: GameComputer)
	{ }


	async afterInit()
	{
		this.logger.log("Game Gateway initialized");
		this.gameComputer.initServer(this.server);
		await this.gamesService.updateMany({ where: { ongoing: true }, data: { ongoing: false } });
	}

	async handleConnection(client: Socket, ...args: any[])
	{
		this.server.to(client.id).emit('handshake', client.data.user);
		const { waitingRooms, ongoingGames } = { waitingRooms: this.getWaitingRooms(), ongoingGames: this.gameComputer.getOngoingGames() };
		this.server.to(client.id).emit('games', { waitingRooms, ongoingGames });
	}

	async handleDisconnect(client: Socket)
	{
		// is socket id in GameWaitingRoom?
		const waitingRoom = await this.waitingRooms.find((v) => v.user1SocketId === client.id);
		if (waitingRoom)
		{
			this.waitingRooms = this.waitingRooms.filter((v) => v.user1SocketId !== client.id);
			this.emitWaitingRooms();
			const updatedUser = await this.userService.updateUser({
				where: { id: client.data.user.id },
				data: { gameStatus: GameStatusType.NONE }
			});
			return true;
		}
		const onGoingroom = await this.gameComputer.findGameBySocketId(client.id);
		// is socket id in OngoingGame?
		if (onGoingroom)
		{
			// if so gracefully close and notify everything
			this.gameComputer.playerDisconnected(client.id);
			this.gameComputer.emitOngoingGames();
			const updatedUser = await this.userService.updateUser({
				where: { id: client.data.user.id },
				data: { gameStatus: GameStatusType.NONE }
			});
		}
		// is socket id a spectator?
		const spectatorRoom = await this.gameComputer.findGameBySpectatorSocketId(client.id);
		if (spectatorRoom)
		{
			this.gameComputer.spectatorDisconnected(spectatorRoom, client.id);
		}
	}

	@SubscribeMessage('leaveGame')
	async leaveGame(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		const ongoingRoom = await this.gameComputer.findGameBySocketId(client.id);
		if (ongoingRoom)
		{
			// if so gracefully close and notify everything
			this.gameComputer.playerDisconnected(client.id);
			this.gameComputer.emitOngoingGames();
			client.leave(ongoingRoom.id);
		}
	}

	@SubscribeMessage('leaveGameAsSpectator')
	async leaveGameAsSpectator(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		const spectatorRoom = await this.gameComputer.findGameBySpectatorSocketId(client.id);
		if (spectatorRoom)
		{
			this.gameComputer.spectatorDisconnected(spectatorRoom, client.id);
			client.leave(spectatorRoom.id);
		}
	}


    @SubscribeMessage('quickplay')
    async quickplay(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
    {
        const availableRoom = this.waitingRooms.find((v) => {return (v.user1SocketId !== client.id && v.user1.id !== user.id && !v.user2 && v.invitation === false && v.type === GameType.QUICKPLAY)});
        if (availableRoom)
        {
            availableRoom.user2 = user;
            availableRoom.user2SocketId = client.id;
            this.waitingRooms = this.waitingRooms.filter((v) => v.user1SocketId !== availableRoom.user1SocketId);
            this.emitWaitingRooms();
            // update game in db
            const ret = await this.gamesService.update(
                {
                    where: {id: availableRoom.id},
                    data:
                    {
                        players: 
                        {
                            create:
                            {
                                score: 0,
                                player:
                                {
                                    connect: {id: availableRoom.user2.id}
                                }
                            }    
                        }
                    }
                });
            const newGame = await this.gameComputer.newGame(availableRoom);
            this.server.to(availableRoom.user1SocketId).to(availableRoom.user2SocketId).emit('roomReady', {roomId: ret.id, theme: availableRoom.theme, user1Name: availableRoom.user1.userName, user2Name: availableRoom.user2?.userName, launchTime: newGame.launchTime});
            this.gameComputer.emitOngoingGames();
            return;
        }
        const ret = await this.gamesService.create({data:{}});
        this.waitingRooms.push(new GameWaitingRoom({id: ret.id, user1: user, user1SocketId: client.id, invitation: false, objective: Objective.SCORE, goal: 5, theme: 'classic', type: GameType.QUICKPLAY}));
        await this.gamesService.update({
            where: {id: ret.id},
            data: {
                players:
                {
                    create:
                    {
                        score: 0,
                        player:
                        {
                            connect: {id: user.id}
                        }
                    }
                }
            }
        })
        this.server.to(client.id).emit('queueing');
    }

	@SubscribeMessage('leaveQueue')
	async leaveQueue(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		const room = this.waitingRooms.find((v) => { return (v.user1SocketId === client.id) });
		if (room)
		{
			this.waitingRooms = this.waitingRooms.filter((v) => v.user1SocketId !== client.id);
			await this.gamesService.remove({
				where: { id: room.id }
			})
			this.server.to(client.id).emit('leftQueue');
			this.emitWaitingRooms();
			return;
		}
		else
		{
			throw new WsException({ status: 404, message: "You're not in any queues" });
		}
	}

    @SubscribeMessage('createCustomGame')
    async createCustomGame (@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody() payload: CustomGame)
    {
        const ret = await this.gamesService.create({data:{}});
        const {objective, goal, invitation, invitedUser, theme} = payload;
        this.waitingRooms.push(new GameWaitingRoom({id: ret.id, user1: user, user1SocketId: client.id, invitation: invitation, invitedUser: invitedUser, objective: objective, goal: goal, theme: theme, type: GameType.CUSTOM}));
        await this.gamesService.update({
            where: {id: ret.id},
            data: {
                players:
                {
                    create:
                    {
                        score: 0,
                        player:
                        {
                            connect: {id: user.id}
                        }
                    }
                }
            }
        })
        if (invitation === true && invitedUser)
        {
            this.server.to(client.id).emit("inviteGameCreated", {gameId: ret.id, invitedUser});
        }
        else
        {
            this.server.to(client.id).emit('queueing');
        }
        this.emitWaitingRooms();
    }

    @SubscribeMessage('joinCustomGame')
    async joinCustomGame(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('room') room: any)
    {
        const customGameRoom = this.waitingRooms.find((v) => {return v.id === room});
        if (!customGameRoom)
        {
            throw new WsException({status: 404, message: "Could not find the requested game"})
        }
        customGameRoom.user2 = user;
        customGameRoom.user2SocketId = client.id;
        this.waitingRooms = this.waitingRooms.filter((v) => v.user1SocketId !== customGameRoom.user1SocketId);
        this.emitWaitingRooms();
        // update game in db
        const ret = await this.gamesService.update(
            {
                where: {id: customGameRoom.id},
                data:
                {
                    players: 
                    {
                        create:
                        {
                            score: 0,
                            player:
                            {
                                connect: {id: customGameRoom.user2.id}
                            }
                        }    
                    }
                }
            });
        const newGame = await this.gameComputer.newGame(customGameRoom);
        this.server.to(customGameRoom.user1SocketId).to(customGameRoom.user2SocketId).emit('roomReady', {roomId: ret.id, user1Name: customGameRoom.user1.userName, user2Name: customGameRoom.user2.userName, theme: customGameRoom.theme, launchTime: newGame.launchTime});
        this.gameComputer.emitOngoingGames();
        return;
    }

	@SubscribeMessage('acceptMatch')
	async joinRoom(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('room') room: string)
	{
		if (!this.gameComputer.userJoin(room, user, client.id))
			return;
		client.join(room);
		this.server.to(client.id).emit('matchAccepted');
	}

	@SubscribeMessage('declineMatch')
	async declineMatch(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
	{
		const game = await this.gameComputer.findGameBySocketId(client.id);

		const isPlayer = this.gameComputer.isAPlayer(game, client.id);
		if (isPlayer)
		{
			this.gameComputer.playerDisconnected(client.id);
			if (isPlayer === 1 && game.readyPlayer2 === false)
			{
				this.server.to(game.user2SocketId).emit('matchDeclinedByOpponent');
			}
			else if (isPlayer === 2 && game.readyPlayer1 === false)
			{
				this.server.to(game.user1SocketId).emit('matchDeclinedByOpponent');
			}
		}
		this.server.to(client.id).emit('matchDeclined');
	}

    @SubscribeMessage('joinAsSpectator')
    async joinAsSpectator(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('room') room: string)
    {
        const gameRoom = await this.gameComputer.findGame(room);
        if (!gameRoom)
            return;
        if (!this.gameComputer.userJoin(room, user, client.id))
            return;
        client.join(room);
        this.server.to(client.id).emit('startGameAsSpectator', {user1Name: gameRoom.user1.userName, user2Name: gameRoom.user2.userName, theme: gameRoom.theme, launchTime: gameRoom.launchTime});
    }

	@SubscribeMessage('paddleMove')
	async paddleMove(@ConnectedSocket() client: Socket, @GetUserWs() user: User, @MessageBody('direction', new ParseEnumPipe(PaddleDirection)) direction: PaddleDirection)
	{
		this.gameComputer.paddleMove(client.id, direction);
	}

    getWaitingRooms()
    {
        const waitingRooms = [];
        for ( let room of this.waitingRooms)
        {
            if (room.type === GameType.QUICKPLAY)
            {
                continue;
            }
            waitingRooms.push(
                {
                    id : room.id,
                    objective: room.objective,
                    goal: room.goal,
                    theme: room.theme,
                    user1: room.user1.userName,
                    invitation: room.invitation,
                    invitedUser: room.invitedUser
                }
            );
        }
        return waitingRooms;
    }

	emitWaitingRooms()
	{
		this.server.emit('waitingRooms', { waitingRooms: this.getWaitingRooms() });
	}

	@SubscribeMessage('games')
	async games(@ConnectedSocket() client: Socket, @GetUserWs() user)
	{
		const { waitingRooms, ongoingGames } = { waitingRooms: this.getWaitingRooms(), ongoingGames: this.gameComputer.getOngoingGames() };
		this.server.to(client.id).emit('games', { waitingRooms, ongoingGames });
	}
}

interface CustomGame
{
    objective: Objective;
    goal: number;
    invitation: boolean;
    invitedUser?: string;
    theme: string;
}
