import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { User } from "@prisma/client";
import { Observable } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserInterceptor implements NestInterceptor {
	constructor(private readonly prisma: PrismaService) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const	wsClient = context.switchToWs().getClient();
		const	wsUser: User = wsClient.data.user;
		const	dbUser = await this.prisma.user.findUnique({where: {id: wsUser.id}})
		if (JSON.stringify(wsUser) !== JSON.stringify(dbUser))
		{
			console.log('dbUser !== wsUser');
			console.log({dbUser}, {wsUser});
			wsClient.data.user = dbUser;
		}
		console.log('COUCOU DE L\'INTERCEPTOR');
		return next.handle();
	}
}