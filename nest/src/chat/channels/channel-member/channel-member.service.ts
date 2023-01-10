import { ImATeapotException, Injectable, Logger, PreconditionFailedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { joinChannelDto } from '../dto';
import { BanMemberDto, ChannelMemberDto } from './dto';

@Injectable()
export class ChannelMemberService
{
	constructor(private readonly prisma: PrismaService) {}
	private readonly logger = new Logger(ChannelMemberService.name);

	async create(dto: joinChannelDto) {
		try {
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
		catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2025')
					throw new PreconditionFailedException('Record not found');
				if (error.code === 'P2002')
					throw new PreconditionFailedException('User already in channel');
			}
			this.logger.error({ error });
			throw new ImATeapotException('something unexpected happened');
		}
	}

	async getChannelRole(dto: ChannelMemberDto) {
		return (await this.prisma.channelMember.findMany({
			where: {
				channelId: dto.channelId,
				role: dto.role
			}
		}))
	}

	async banUser(dto: BanMemberDto) {
		const ret = await this.prisma.channelMember.update({
			where: {
				userId_channelId: { userId: dto.userId, channelId: dto.channelId }
			},
			data: {
				banExpires: new Date(Date.now() + dto.banTime)
			}
		})
		this.changeRole({ userId: dto.userId, channelId: dto.channelId })
	}

	async changeRole(dto: ChannelMemberDto) {
		const ret = await this.prisma.channelMember.update({
			where: {
				userId_channelId: { userId: dto.userId, channelId: dto.channelId }
			},
			data: {
				role: dto.role
			}
		})
	}

	async getOne(dto: ChannelMemberDto) {
		return (await this.prisma.channelMember.findUnique({
			where: { userId_channelId: { userId: dto.userId, channelId: dto.channelId } }
		}))
	}

	async getMany(dto: ChannelMemberDto) {
		if (dto.channelId === null) {
			return (await this.prisma.channelMember.findMany({
				where: { userId: dto.userId }
			}))
		}
		return (await this.prisma.channelMember.findMany({
			where: { channelId: dto.channelId }
		}))
	}

	async usersFromChannel(params: Prisma.ChannelMemberFindManyArgs) {
		const { where, select } = params;
		return this.prisma.channelMember.findMany({
			where,
			select
		})
	}
}
