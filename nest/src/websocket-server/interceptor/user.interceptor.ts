import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { User } from "@prisma/client";
import { Observable } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserInterceptor implements NestInterceptor
{
	constructor(private readonly prisma: PrismaService) { }

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>
	{
		const wsClient = context.switchToWs().getClient();
		const wsUser: User = wsClient.data.user;
		const dbUser = await this.prisma.user.findUnique({
			where:
			{
				id: wsUser.id
			},
			include:
			{
				channels:
				{
					include:
					{
						channel:
						{
							select:
							{
								id: true,
								channelName: true,
								mode: true,
								whitelist: true,
								createdAt: true,
							}
						}
					}
				}
			}
		})
		if (JSON.stringify(wsUser) !== JSON.stringify(dbUser))
		{
			wsClient.data.user = dbUser;
		}
		return next.handle();
	}
}
