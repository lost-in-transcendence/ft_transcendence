import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto } from "./dto";

@Injectable()
export class MessagesService
{
	constructor(private readonly prisma: PrismaService) {}

	create(dto: CreateMessageDto)
	{

	}
}
