import { Injectable } from '@nestjs/common';
import { PlayStats, Prisma, User } from '@prisma/client';
import { create } from 'domain';
import { PrismaService } from 'src/prisma/prisma.service';

type userFindManyParams =
	{
		skip?: number;
		take?: number;
		cursor?: Prisma.UserWhereUniqueInput;
		where?: Prisma.UserWhereInput;
		orderBy?: Prisma.UserOrderByWithRelationInput;
	}

@Injectable()
export class UsersService {

	constructor(private readonly prisma: PrismaService) {

	}

	async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
		return this.prisma.user.findUnique(
			{
				where: userWhereUniqueInput
			});
	}

	async users(params: userFindManyParams): Promise<User[]> {
		const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.user.findMany(
			{
				skip,
				take,
				cursor,
				where,
				orderBy
			});
	}

	async createUser(
		data: Prisma.UserCreateInput): Promise<User> {
		return this.prisma.user.create(
			{
				data:
				{
					...data,
					playStats:
					{
						create: {}
					}
				}
			});
	}

	async updateUser(params: {
		where: Prisma.UserWhereUniqueInput;
		data: Prisma.UserUpdateInput;
	}): Promise<User> {
		const { data, where } = params;
		return this.prisma.user.update(
			{
				data,
				where
			});
	}

	async getUserModal(where: Prisma.UserWhereUniqueInput, include: Prisma.UserInclude): Promise<User> {

		const ret = await this.prisma.user.findUnique({
			where,
			include
		});

		return (ret);
	}
}
