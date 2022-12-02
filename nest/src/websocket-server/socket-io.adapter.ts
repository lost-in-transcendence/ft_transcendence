import { INestApplicationContext, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { User } from "@prisma/client";
import { Server, Socket } from "socket.io";
import { env } from "process";

import { PrismaService } from "src/prisma/prisma.service";

export class SocketIOAdapter extends IoAdapter
{
	private readonly logger = new Logger(SocketIOAdapter.name);

	constructor(private readonly app: INestApplicationContext)
	{
		super(app);
	}

	createIOServer(port: number, options?: any)
	{
		this.logger.log('Creating Socket.io server');

		const jwt = this.app.get(JwtService);
		const prisma = this.app.get(PrismaService);
		const server: Server = super.createIOServer(port);

		server.of('chat').use(wsAuthMiddleWare(jwt, prisma, this.logger));

		return (server);
	}
}

const wsAuthMiddleWare = (jwt: JwtService, prisma: PrismaService, logger: Logger) =>
	async (socket: Socket, next) =>
	{

		logger.debug('In ws MiddleWare');

		try
		{
			const token = socket.handshake.headers.authorization.split(' ')[1];
			const decoded = jwt.verify(token, {secret: env.JWT_SECRET});
			const user: User = await prisma.user.findUnique({where: { id: decoded.id }});
			socket.data.user = user;
			next();
		}
		catch (err)
		{
			logger.error('ERROR')
			next(new Error('Forbidden'));
		}
	}
