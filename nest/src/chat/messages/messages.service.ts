import { ForbiddenException, ImATeapotException, Injectable, Logger, NotFoundException, PreconditionFailedException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Message } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto } from "./dto";

@Injectable()
export class MessagesService
{
	private readonly logger = new Logger(MessagesService.name);

	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateMessageDto): Promise<Message>
	{
		try
		{
			const newMessage = await this.prisma.message.create({
				data: {
					channel: {connect: {id: dto.channelId}},
					sender: {connect: {id: dto.userId}},
					content: dto.content
				},
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
}
