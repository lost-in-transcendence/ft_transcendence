import { Logger, UseFilters, UseInterceptors, UsePipes } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { env } from "process";
import { CustomWsFilter } from "src/websocket-server/filters";
import { UserInterceptor } from "src/websocket-server/interceptor";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { Socket, Namespace } from 'socket.io';
import { User } from '@prisma/client';
import { GetUserWs } from "src/users/decorator/get-user-ws";
import { GamesService } from "./game.service";
import { create } from "domain";
import { GetUser } from "src/users/decorator";

class GameWaitingRoom 
{
    user1: User;
    user1SocketId: string;
    user2?: User;
    user2SocketId?: string;
    invitation: boolean;
    invitedUser?: string;

    constructor(params: {user1: User, user1SocketId: string, invitation: boolean, user2?: User, user2SocketId?: string, invitedUser?: string}) {
        const {user1, user1SocketId, user2, user2SocketId, invitation, invitedUser} = params;
        this.user1 = user1;
        this.user1SocketId = user1SocketId;
        this.user2 = user2;
        this.user2SocketId = user2SocketId;
        this.invitation = invitation;
        this.invitedUser = invitedUser;
    }
}

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`, namespace: 'game'})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
    private readonly logger = new Logger(GameGateway.name);
    private waitingRooms : GameWaitingRoom[] = [];

	constructor(private readonly gamesService: GamesService) { } 

    @WebSocketServer()
    server: Namespace;

    afterInit()
    {
        this.logger.log("Game Gateway initialized");
        const timerId = setInterval(() => 
		{
            const rooms = this.waitingRooms
            console.log({rooms});
		}, 15000)
    }

    async handleConnection(client: Socket, ...args: any[])
    {
		this.logger.log(`Client ${client.id} connected to Game websocket Gateway`);
        this.logger.debug(client.data);
        this.server.to(client.id).emit('handshake', client.data.user);
    }

    async handleDisconnect(client: Socket)
	{
        // is socket id in GameWaitingRoom?
        const waitingRoom = this.waitingRooms.find((v) => v.user1SocketId === client.id);
        if (waitingRoom)
        {
            this.waitingRooms = this.waitingRooms.filter((v) => v.user1SocketId !== client.id);
        }
        // is socket id in OngoingGame?
        // if so gracefully close and notify everything
		this.logger.log(`Client ${client.id} disconnected from Game websocket Gateway`);
	}

    @SubscribeMessage('quickplay')
    async quickplay(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
    {
        // check if there are any waiting rooms where invitation === false, if so join it and create an actual room + game
        const availableRoom = this.waitingRooms.find((v) => {return (v.user1SocketId !== client.id && v.user1.id !== user.id && !v.user2 && v.invitation === false)});
        console.log({availableRoom});
        if (availableRoom)
        {
            // blinding shining star
            // you won't see so far
            // know what can't be shown
            // feel what can't be known

            // you were an isle unto thyself
            // you had a heart you hadn't felt
            // why wouldit hurt me 
            // or was it real

            // it was the night we had to part 
            // we were afraid to miss the start
            // what did it matter
            // why would it matter 
            // and could we heal
            availableRoom.user2 = user;
            availableRoom.user2SocketId = client.id;
            this.logger.debug(availableRoom);
            this.waitingRooms = this.waitingRooms.filter((v) => v.user1SocketId !== availableRoom.user1SocketId);
            // create game in db
            const ret = await this.gamesService.create({data: 
                {
                    players: { create: [ 
                        {
                            score: 0,
                            player:
                            {
                                connect: { id: availableRoom.user1.id }
                            }
                        },
                        {
                            score: 0,
                            player:
                            {
                                connect: { id: availableRoom.user2.id }
                            }
                        }
                    ]}
                }});
            this.server.to(availableRoom.user1SocketId).to(availableRoom.user2SocketId).emit('roomReady', {room: ret.id});
            // get game ID and use as room ID
            // send back room ID to both clients
            // have them send a message to join the room
            // when a user joins the room, have them join the "OngoingGame" class
            // once 2 users with the corresponding user IDs join the room, the game can start
            // A user should send its userID when joining the room to make this possible
            console.log("A game was motherfucking created")
            // create game, maye like a joinGame() function?
            return;
        }
        this.waitingRooms.push(new GameWaitingRoom({user1: user, user1SocketId: client.id, invitation: false}));
        this.server.to(client.id).emit('queueing');
    }

    @SubscribeMessage('leaveQueue')
    async leaveQueue(@ConnectedSocket() client: Socket, @GetUserWs() user: User)
    {
        const room = this.waitingRooms.find((v) => {return (v.user1SocketId === client.id)});
        if (room)
        {
            this.waitingRooms = this.waitingRooms.filter((v) => v.user1SocketId !== client.id);
            this.server.to(client.id).emit('leftQueue');
            return;
        }
        else
        {
            throw new Error("You're not in any queues you dumbass!!!!!!!!!!!!!!!!");
        }
    }

    // async createGame(waitingRoom: GameWaitingRoom)
    // {
    //     // call gameService and create a new DB Game using the waiting room info, also create an "OngoingGame" class made with the DB Game info
    //     const ret = await this.gamesService.create({data: {}});
    //     return ret;
    // }

    @SubscribeMessage('invite')
    async invite(@ConnectedSocket() client: Socket, @GetUserWs() user, @MessageBody() dto: any)
    {
        // fetch invited userId first and check they're online (how do we know? Maybe only allow invite if invited.status !== OFFLINE or INVISIBLE)
        this.waitingRooms.push(new GameWaitingRoom({user1: user, user1SocketId: client.id, invitation: true, invitedUser: dto.userId}));

    }

    // What should happen when someone wants to start a game (not considering invites for now)?
    // Is a room created instantly? Do we wait until 2 players are queueing to create the room?
    // What should the room's name be? It has to be unique.
    
    // We could use a similar tactic as the channel gateway, as in use the game ID from the db.
    // The problem is that means the game needs to be created in the DB already when players start joining.
    // So if a second player never joins, or if an error happens it has to be deleted

    // I think we can implement an actual queueing system.
    // 1) Make a UserQueue class that stores every user (socket id) currently waiting for a game
    // Even though we're not doing a skill-matching system, we still want to be able to:
    //      - tell if there is 1 player waiting or not
    //      - get their userId
    //      - remove them from the queue if they disconnect or leave the page
    // 2) Once a user joins the queue and there are >= 2 people in it:
    //      - take their socket IDs and make them join a room (either generate room name randomly or use game ID from db)
    //      - maybe a have a protection so you can't play against yourself? or maybe not lol it could be funny
    //      - emit a message to say the game is starting, maybe wait for a response just to check they're still connected? like a ping
    // 3) Then assuming the backend does the computation:
    //      - save which socket id is player 1 and player 2
    //      - find a way to access their paddle position.
    //          - if we're doing backend computation, that means we need to be able to access the players' position at all time
    //          only thing is I'm not sure we can put event listeners inside another event listener
    //          Instead we might have to store the paddle position inside another class, and get it when we need it. Not sure yet
    //      - every x ms compute where the ball is, if there have been any collisions, any points scored etc
    //      - send a packet with this data to both clients (paddlepos, ballpos, if a point was scored etc)
    // 4) When the game ends
    //      - either edit or create the game entry in the DB
    //      - disconnect everyone from the room (including spectators)
    //      - probably send a message before that to say that the game is ended so the frontend knows to display a message or whatever
    // 5) In case of an error / disconnect
    //      - no fucking idea. Probably send a message to remaining clients explaning that something went wrong / a player has disconnected
    //      - then save the game anyway with the current score, but don't make it count to any stats?
    //      - or just don't save the game at all and that's it.
}
