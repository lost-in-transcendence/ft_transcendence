import { ForbiddenException, ImATeapotException, Injectable, Logger, NotFoundException, PreconditionFailedException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Message, Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto } from "./dto";

@Injectable()
export class MessagesService
{
	private readonly logger = new Logger(MessagesService.name);

	constructor(private readonly prisma: PrismaService) {}

	async create(data: Prisma.MessageCreateInput): Promise<Message>
	{
		try
		{
			const newMessage = await this.prisma.message.create({
				data
			});
			return (newMessage);
		}
		catch (err)
		{
			if (err instanceof PrismaClientKnownRequestError)
			{
				if (err.code === 'P2025')
					throw new PreconditionFailedException('Record not found');
			}
			throw new ImATeapotException('Something unexpected happened');
		}
	}

	async getMany(channelId: string, nb: number): Promise<Message[]>
	{
		const manyMessages = await this.prisma.message.findMany({
			where: { channelId: channelId },
			take: nb,
			orderBy: { createdAt: 'desc' }
		})
		return (manyMessages);
	}

	async messages(params: Prisma.MessageFindManyArgs): Promise<Message[]> {
		const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.message.findMany(
			{
				skip,
				take,
				cursor,
				where,
				orderBy
			});
	}
}
