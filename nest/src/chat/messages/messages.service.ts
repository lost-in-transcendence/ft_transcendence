import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class MessagesService
{
	constructor(private readonly prisma: PrismaService) {}

	create(content: string, userId: string, channelId: string)
	{

	}
}
