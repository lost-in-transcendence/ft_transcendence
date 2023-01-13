import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PlayStatsService
{
    constructor(private readonly prisma: PrismaService) {}

    async create(params: Prisma.PlayStatsCreateArgs)
	{
		return await this.prisma.playStats.create(params);
	}

	async findMany(params: Prisma.PlayStatsFindManyArgs)
	{
		return await this.prisma.playStats.findMany(params);
	}

	async findOne(params: Prisma.PlayStatsFindUniqueArgs)
	{
		return await this.prisma.playStats.findUnique(params);
	}

    async findFirst (params: Prisma.PlayStatsFindFirstArgs)
    {
        return await this.prisma.playStats.findFirst(params);
    }

	async update(params: Prisma.PlayStatsUpdateArgs)
	{
		return await this.prisma.playStats.update(params);
	}

	async updateMany(params: Prisma.PlayStatsUpdateManyArgs)
	{
		return await this.prisma.playStats.updateMany(params);
	}

	async remove(params: Prisma.PlayStatsDeleteArgs)
	{
		return await this.prisma.playStats.delete(params);
	}
}