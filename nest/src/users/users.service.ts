import { ImATeapotException, Injectable, Logger, NotAcceptableException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { PlayStats, Prisma, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { create } from 'domain';
import { PrismaService } from 'src/prisma/prisma.service';

// type userFindManyParams =
// 	{
// 		skip?: number;
// 		take?: number;
// 		cursor?: Prisma.UserWhereUniqueInput;
// 		where?: Prisma.UserWhereInput;
// 		orderBy?: Prisma.UserOrderByWithRelationInput;
// 	}

@Injectable()
export class UsersService {

	private readonly logger = new Logger(UsersService.name);

	constructor(private readonly prisma: PrismaService) {

	}

	/*
	** @desc Finds and returns a User instance in database
	**
	** @param {Prisma.UserWhereUniqueInput} where Unique User input data (See Prisma Doc)
	** @returns {Promis<User | null>} Returns a Promise to a User if found, or null if not found
	*/
	async user(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
		return this.prisma.user.findUnique(
			{
				where
			});
	}

	/*
	** @desc Finds and returns a User instance, including extra relation fields
	**
	** @param {Prisma.UserWhereUniqueInput} where Unique User input data (See Prisma Doc)
	** @param {Prisma.UserInclude} include Class containing all optional relation fields to be included in result (See Prisma Doc)
	** @returns {Promis<User>} Returns a Promise to the found User, or null if not found
	*/
	async userModal(where: Prisma.UserWhereUniqueInput, include: Prisma.UserInclude): Promise<User | null> {

		const ret = await this.prisma.user.findUnique({
			where,
			include
		});

		return (ret);
	}

	/*
	** @desc Finds and returns a User instance, with only selected fields
	**
	** @param {Prisma.UserWhereUniqueInput} where Unique User input data (See Prisma Doc)
	** @param {Prisma.UserSelect} select Class containing all fields to be selected int he query (See Prisma Doc)
	** @returns {Promis<User>} Returns a Promise to the found User, or null if not found
	*/
	async userSelect(where: Prisma.UserWhereUniqueInput, select: Prisma.UserSelect)
	{
		const ret = await this.prisma.user.findUnique({
			where,
			select,
		});
		return (ret);
	}

	/*
	** @desc Finds and returns ALL User instances in database
	**
	** @param {userFindManyParams} params See corresponding type above, these are parameters used by the prisma findMany method to give query options
	** @returns {Promis<User[]]>} Returns a Promise to an array of all Users in database
	*/
	async users(params: Prisma.UserFindManyArgs): Promise<User[]> {
		// const { skip, take, cursor, where, orderBy } = params;
		return this.prisma.user.findMany(
			params);
	}

	/*
	** @desc Creates a new User instance and logs it in database
	**
	** @param {Prisma.UserCreateInput} data All data necessary or optional for creating a User (see Prisma Doc)
	** @returns {Promis<User>} Returns a Promise to the newly made User
	*/
	async createUser(
		data: Prisma.UserCreateInput): Promise<User>
	{
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

	/*
	** @desc Updates an existing User instance with new information
	**
	** @param {Prisma.UserWhereUniqueInput} where Unique User input data (See Prisma Doc)
	** @param {Prisma.UserUpdateInput} data Class containing all potentially updatable User data (See Prisma Doc)
	** @returns {Promis<User>} Returns a Promise to the updated User
	*/
	async updateUser(params:
	{
		where: Prisma.UserWhereUniqueInput;
		data: Prisma.UserUpdateInput;
	}): Promise<User> {
		const { data, where } = params;
		try
		{
			const ret = await this.prisma.user.update(
				{
					data,
					where
				});
			return ret;
		}
		catch (err)
		{
			if (err instanceof PrismaClientKnownRequestError)
			{
				if (err.code === 'P2025')
					throw new PreconditionFailedException('Record not found');
				else if (err.code === 'P2002')
					throw new NotAcceptableException('Unique field not avalaible');
			}
			throw new ImATeapotException('Something unexpected happened');
		}
	}

	async deleteUser(where: Prisma.UserWhereUniqueInput)
	{
		const deletedUser = await this.prisma.user.delete({where});
		return (deletedUser);
	}
}
