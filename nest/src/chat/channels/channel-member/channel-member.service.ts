import { ForbiddenException, ImATeapotException, Injectable, Logger, PreconditionFailedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { joinChannelDto } from '../dto';

import { BanMemberDto, ChannelMemberDto, KickUserDto } from './dto';

@Injectable()
export class ChannelMemberService
{
	constructor(private readonly prisma: PrismaService) { }
	private readonly logger = new Logger(ChannelMemberService.name);

	async create(dto: joinChannelDto)
	{
		try
		{
			const newChannelMember = await this.prisma.channelMember.create({
				data:
				{
					channel: { connect: { id: dto.channelId } },
					user: { connect: { id: dto.userId } },
					role: dto.role
				},
				include:
				{
					channel:
					{
						select:
						{
							id: true,
							channelName: true,
							mode: true,
							members: true
						}
					}
				}
			});
			return (newChannelMember);
		}
		catch (error)
		{
			if (error instanceof PrismaClientKnownRequestError)
			{
				if (error.code === 'P2025')
					throw new PreconditionFailedException('Record not found');
				if (error.code === 'P2002')
					throw new PreconditionFailedException('User already in channel');
			}
			// this.logger.error({ error });
			throw new ImATeapotException('something unexpected happened');
		}
	}

	async getChannelRole(dto: ChannelMemberDto)
	{
		return (await this.prisma.channelMember.findMany({
			where: {
				channelId: dto.channelId,
				role: dto.role
			}
		}))
	}

	async banUser(dto: BanMemberDto)
	{
		const bannedUser = await this.prisma.channelMember.findUnique({where: {userId_channelId: {userId: dto.userId, channelId: dto.channelId}}});
		if (!bannedUser)
		{
			throw new ForbiddenException('User is not in channel');
		}
		if (bannedUser.role === 'OWNER')
			throw new ForbiddenException(`Cannot ban the owner of a channel`);
		try {

			const ret = await this.prisma.channelMember.update({
				where: {
					userId_channelId: { userId: dto.userId, channelId: dto.channelId }
				},
				data: {
					banExpires: new Date(Date.now() + dto.banTime),
					role: 'BANNED'
				}
			})
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

	async kickUser(dto: KickUserDto)
	{
		const kickedUser = await this.prisma.channelMember.findUnique({where: {userId_channelId: {userId: dto.userId, channelId: dto.channelId}}});
		if (!kickedUser)
		{
			throw new ForbiddenException('User is not in channel');
		}
		if (kickedUser.role === 'OWNER')
			throw new ForbiddenException('Cannot kick the owner of a channel');
		try
		{
			const ret = await this.prisma.channelMember.delete(
				{
					where:
					{
						userId_channelId: {userId: dto.userId, channelId: dto.channelId}
					}
				}
			)
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


	async muteUser(dto: BanMemberDto)
	{
		const mutedUser = await this.prisma.channelMember.findUnique({where: {userId_channelId: {userId: dto.userId, channelId: dto.channelId}}});
		if (!mutedUser)
		{
			throw new ForbiddenException('User is not in channel');
		}
		if (mutedUser.role === 'OWNER')
			throw new ForbiddenException(`Cannot mute the owner of a channel`);
		try {

			const ret = await this.prisma.channelMember.update({
				where: {
					userId_channelId: { userId: dto.userId, channelId: dto.channelId }
				},
				data: {
					muteExpires: new Date(Date.now() + dto.banTime),
					role: 'MUTED'
				}
			});
			return (ret);
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

	async changeRole(dto: ChannelMemberDto)
	{
		try{
			const ret = await this.prisma.channelMember.update({
				where: {
				userId_channelId: { userId: dto.userId, channelId: dto.channelId }
				},
				data: {
					role: dto.role
				},
				include:
				{
					channel:
					{
						select:
						{
							id: true,
							channelName: true,
							mode: true,
							members: true
						}
					}
				}
			})
			return (ret)
		}
		catch(error)
		{
			if (error instanceof PrismaClientKnownRequestError)
			{
				if (error.code === 'P2025')
					throw new PreconditionFailedException('Record to update not found');
			}
			// this.logger.error(error.code);
		}
	}

	async getOne(dto: ChannelMemberDto)
	{
		return (await this.prisma.channelMember.findUnique({
			where: { userId_channelId: { userId: dto.userId, channelId: dto.channelId } }
		}))
	}

	async getMany(dto: ChannelMemberDto)
	{
		if (dto.channelId === null)
		{
			return (await this.prisma.channelMember.findMany({
				where: { userId: dto.userId }
			}))
		}
		return (await this.prisma.channelMember.findMany({
			where: { channelId: dto.channelId }
		}))
	}

	async findMany(params: Prisma.ChannelMemberFindManyArgs)
	{
		return await this.prisma.channelMember.findMany(params);
	}

	async usersFromChannel(params: Prisma.ChannelMemberFindManyArgs)
	{
		const { where, select } = params;
		return this.prisma.channelMember.findMany({
			where,
			select
		})
	}

	async getBannedFromChannels(userId: Prisma.ChannelMemberWhereInput)
	{
		const bannedFromList = await this.prisma.channelMember.findMany({
			where:
			{
				AND:
					[
						userId,
						{ role: 'BANNED' }
					]
			}
		});
		return (bannedFromList);
	}

	async amINaughty(userId: Prisma.ChannelMemberWhereInput)
	{
		const naughtyList = await this.prisma.channelMember.findMany({
			where:
			{
				AND:
					[
						userId,
						{
							OR:
								[
									{ role: 'BANNED' },
									{ role: 'MUTED' }
								]
						}
					]
			}
		});
		return (naughtyList);
	}

	async getBanList(channelId: Prisma.ChannelMemberWhereInput)
	{
		const banList = await this.prisma.channelMember.findMany({
			where:
			{
				AND:
					[
						channelId,
						{ role: 'BANNED' }
					]
			},
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
						avatarPath: true
					}
				}
			}
		});
		return (banList);
	}

	async getMuteList(channelId: Prisma.ChannelMemberWhereInput)
	{
		const muteList = await this.prisma.channelMember.findMany({
			where:
			{
				AND:
					[
						channelId,
						{ role: 'MUTED' }
					]
			},
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
						avatarPath: true
					}
				}
			}
		});
		return (muteList);
	}
}
