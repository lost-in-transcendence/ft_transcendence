import { Logger, UseFilters, UseInterceptors, UsePipes } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { env } from "process";
import { CustomWsFilter } from "src/websocket-server/filters";
import { UserInterceptor } from "src/websocket-server/interceptor";
import { WsValidationPipe } from "src/websocket-server/pipes";
import { Socket, Namespace } from 'socket.io';
import { User } from '@prisma/client';

@UseInterceptors(UserInterceptor)
@UseFilters(new CustomWsFilter())
@UsePipes(new WsValidationPipe({ whitelist: true }))
@WebSocketGateway({ cors: `${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}`, namespace: 'pong'})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
    private readonly logger = new Logger(GameGateway.name);

	constructor() { } 

    @WebSocketServer()
    server: Namespace;

    afterInit()
    {
        this.logger.log("Game Gateway initialized");
    }

    async handleConnection(client: Socket, ...args: any[])
    {
		this.logger.log(`Client ${client.id} connected to Game websocket Gateway`);
        this.server.to(client.id).emit('handshake', client.data.user);
    }

    async handleDisconnect(client: Socket)
	{
		this.logger.log(`Client ${client.id} disconnected from Game websocket Gateway`);
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
