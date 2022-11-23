import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Channel, Prisma, RoleType, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

import { CreateChannelDto } from './dto';
import { UpdateChannelDto } from './dto';

@Injectable()
export class ChannelsService
{
	constructor(private readonly prisma: PrismaService) { }

	async create(dto: CreateChannelDto, id: string): Promise<Channel>
	{
		let data: Prisma.ChannelCreateInput = { channelName: dto.channelName, mode: dto.mode };

		if (dto.mode === 'PROTECTED')
		{
			const hash = await bcrypt.hash(dto.password || '', 10);
			// data.hash = hash;
		}
		try
		{
			const newChannel: Channel = await this.prisma.channel.create({
				data:
				{
					...data,
					members:
					{
						create:
						{
							role: RoleType.OWNER,
							user:
							{
								connect:
								{
									id
								}
							}
						}
					}
				},
			})
			// delete newChannel.hash; // Best workaround I could find
			return (newChannel);
		}
		catch (error)
		{
			if (error instanceof PrismaClientKnownRequestError)
			{
				if (error.code === 'P2002')
					throw new ForbiddenException(`Channel ${dto.channelName} already exists`);
			}
			console.error(error);
			throw new ForbiddenException('Unknown error has happened');
		}
	}

	async findAll(): Promise<Channel[]>
	{
		const allChannels = await this.prisma.channel.findMany({});
		return (allChannels);
	}

	async findOne(where: Prisma.ChannelWhereUniqueInput): Promise<Channel>
	{
		return (this.prisma.channel.findUnique({where}));
	}

	async update( where: Prisma.ChannelWhereUniqueInput, data: Prisma.ChannelUpdateInput) : Promise<Channel>
	{
		const updatedChannel = await this.prisma.channel.update({ data, where })
		return (updatedChannel);
	}

	// async update(id: string, dto: UpdateChannelDto): Promise<Channel>
	// {
	// 	let data: Prisma.ChannelUpdateInput = {mode: dto.mode};

	// 	if (dto.password)
	// 	{
	// 		const hash: string = await bcrypt.hash(dto.password, 10);
	// 		data.hash = hash;
	// 		data.mode = 'PROTECTED';
	// 	}
	// 	try
	// 	{
	// 		const updatedChannel = await this.prisma.channel.update({
	// 			where: {channelName: id},
	// 			data
	// 		});
	// 		delete updatedChannel.hash;
	// 		return (updatedChannel);
	// 	}
	// 	catch (error)
	// 	{
	// 		if (error instanceof PrismaClientKnownRequestError)
	// 		{
	// 			if (error.code === 'P2025')
	// 				throw new NotFoundException(`Channel ${id} does not exist`);
	// 		}
	// 		throw new ForbiddenException('Unknown error has happened');
	// 	}
	// }

	async remove(id: string)
	{
		await this.prisma.channelMember.deleteMany({where: {channelId: id}});
		return this.prisma.channel.delete({where: {id: id}});
	}
}
