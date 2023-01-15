import { ImATeapotException, Injectable, Logger, PreconditionFailedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
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

	async updateMany(params: Prisma.GameUpdateManyArgs)
	{
		return await this.prisma.game.updateMany(params);
	}

	async remove(params: Prisma.GameDeleteArgs)
	{
		try{
			return await this.prisma.game.delete(params);
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