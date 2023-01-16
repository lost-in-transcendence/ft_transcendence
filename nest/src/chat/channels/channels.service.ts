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
import { BanMemberDto, ChannelMemberDto } from './channel-member/dto';
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
		let role: RoleType = RoleType.OWNER;

		if (dto.mode === 'PRIVMSG')
			role = RoleType.MEMBER;
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
							role,
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
					members:
					{
						select:
						{
							role: true,
							timeJoined: true,
							user:
							{
								select:
								{
									id: true,
									userName: true,
									status: true,
									gameStatus: true,
								}
							}
						}
					},
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
			throw new ForbiddenException('Unknown error has happened');
		}
	}

	async joinChannel(dto: joinChannelDto)
	{
		if (dto.role === "INVITED")
			return (await this.channelMember.changeRole({channelId: dto.channelId, userId: dto.userId, role: "MEMBER"}))
		else
			return (await this.channelMember.create(dto))
	}

	async leaveChannel(where: Prisma.ChannelMemberWhereUniqueInput)
	{
		return this.prisma.channelMember.delete({ where });
	}

	async banUser(dto: BanMemberDto)
	{
		const data: ChannelMemberDto = { userId: dto.userId, channelId: dto.channelId, role: 'BANNED' };
		await this.channelMember.changeRole(data);
	}
	async unbanUser(userId: string, channelId: string)
	{
		const dto: ChannelMemberDto = { userId, channelId, role: 'MEMBER' };
		await this.channelMember.changeRole(dto)
	}

	async findAll(): Promise<Channel[]>
	{
		const allChannels = await this.prisma.channel.findMany({});
		return (allChannels);
	}

	async channels(params: Prisma.ChannelFindManyArgs)
	{
		return this.prisma.channel.findMany(params);
	}

	async channelSelect(params: Prisma.ChannelFindUniqueArgsBase)
	{
		const { where, select } = params;
		return this.prisma.channel.findUnique({ where, select });
	}

	async channel(params: Prisma.ChannelFindUniqueArgsBase)
	{
		const { where, include } = params;
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
		try {

			const updatedChannel = await this.prisma.channel.update({ data, where })
			return (updatedChannel);
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

	async remove(id: string)
	{
		return this.prisma.channel.delete({ where: { id: id } });
	}
}
