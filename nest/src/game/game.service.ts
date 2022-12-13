import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GamesService
{
    private readonly logger = new Logger(GamesService.name);

	constructor(private readonly prisma: PrismaService) { }

	async create(params: Prisma.GameCreateArgs)
	{
		return await this.prisma.game.create(params);
	}

	async findMany(params: Prisma.GameFindManyArgs)
	{
		return await this.prisma.game.findMany(params);
	}

	async findOne(params: Prisma.GameFindUniqueArgs)
	{
		return await this.prisma.game.findUnique(params);
	}

    async findFirst (params: Prisma.GameFindFirstArgs)
    {
        return await this.prisma.game.findFirst(params);
    }

	async update(params: Prisma.GameUpdateArgs)
	{
		return await this.prisma.game.update(params);
	}

	async remove(params: Prisma.GameDeleteArgs)
	{
		return await this.prisma.game.delete(params);
	}
}