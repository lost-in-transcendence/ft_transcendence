import { Body, Controller, Get, UseGuards } from "@nestjs/common";
import { Message } from "@prisma/client";
import { FullAuthGuard } from "src/auth/guard/full-auth.guard";
import { FindUniqueChannelDto } from "../channels/dto";
import { MessagesService } from "./messages.service";

@UseGuards(FullAuthGuard)
@Controller('message')
export class MessagesController
{
	constructor(private readonly messageService: MessagesService) {}

	@Get('/fifty')
	async getFifty(@Body('channelId') channelId: string): Promise<Message[]>
	{
		return (this.messageService.getMany(channelId, 50));
	}
}