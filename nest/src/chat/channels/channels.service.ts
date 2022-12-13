import { ForbiddenException, ImATeapotException, Injectable, Logger, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { Channel, ChannelMember, ChannelModeType, Message, Prisma, RoleType, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

import { CreateChannelDto } from './dto';
import { UpdateChannelDto } from './dto';
import { ChannelDto, PartialChannelDto } from './dto/channel-dto';
import { CreateUserDto, UserIncludeQueryDto } from 'src/users/dto';
import { joinChannelDto } from './dto/join-channel.dto';
import { ChannelMemberDto } from './channel-member/dto';
import { ChannelMemberService } from './channel-member/channel-member.service';
import { Server } from 'http';

@Injectable()
export class ChannelsService
{
	private readonly logger = new Logger(ChannelsService.name);

	constructor(private readonly prisma: PrismaService, 
				private readonly channelMember: ChannelMemberService) { }

	async create(dto: CreateChannelDto, id: string): Promise<PartialChannelDto>
	{
		let data: Prisma.ChannelCreateInput = { channelName: dto.channelName, mode: dto.mode };

		if (dto.mode === 'PROTECTED')
		{
			const hash = await bcrypt.hash(dto.password || '', 10);
			data.hash = hash;
		}
		try
		{
			const newChannel: PartialChannelDto = await this.prisma.channel.create({
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
				select:
				{
					id: true,
					channelName: true,
					mode: true,
					createdAt: true,
					members: true,
					messages: true,
				}
			})
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

	async joinChannel(dto: joinChannelDto)
	{
		return (await this.channelMember.create(dto))
	}

	async leaveChannel(where: Prisma.ChannelMemberWhereUniqueInput)
	{
		return this.prisma.channelMember.delete({where});
	}

	async banUser(userId: string, channelId: string)
	{
		const dto: ChannelMemberDto = {userId, channelId, role: 'BANNED'};
		console.log("BANUSER UPDATE ROLE", dto)
		await this.channelMember.changeRole(dto);

	}

	async findAll(): Promise<Channel[]>
	{
		const allChannels = await this.prisma.channel.findMany({});
		return (allChannels);
	}

	async channels(params: Prisma.ChannelFindManyArgs)/*: Promise<Channel[]>*/: Promise<PartialChannelDto[]>
	{
		const { skip, take, cursor, where, orderBy, select, include, distinct } = params;
		return this.prisma.channel.findMany(
			{
				select,
				// include,
				skip,
				take,
				cursor,
				where,
				orderBy,
				distinct,
			});
	}

	async channelSelect(params: Prisma.ChannelFindUniqueArgsBase)
	{
		const {where, select} = params;
		return this.prisma.channel.findUnique({ where, select });
	}

	async channel(params: Prisma.ChannelFindUniqueArgsBase)
	{
		const {where, include} = params;
		return this.prisma.channel.findUnique({
			where,
			include,
		})
	}

	async findOne(where: Prisma.ChannelWhereUniqueInput): Promise<Channel>
	{
		return (this.prisma.channel.findUnique({ where }));
	}

	async update(where: Prisma.ChannelWhereUniqueInput, data: Prisma.ChannelUpdateInput): Promise<Channel>
	{
		const updatedChannel = await this.prisma.channel.update({ data, where })
		return (updatedChannel);
	}

	async remove(id: string)
	{
		return this.prisma.channel.delete({ where: { id: id } });
	}
}
