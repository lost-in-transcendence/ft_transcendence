import { Body, Controller, Get, HttpCode, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { FullAuthGuard } from 'src/auth/guard/full-auth.guard';
import { GetUser } from './decorator';
import { CreateUserDto, UpdateUserDto, UserIncludeQueryDto } from './dto/users.dto'
import { UsersService } from './users.service';

@UseGuards(FullAuthGuard)
@Controller('users')
export class UsersController
{
	readonly userIncludeAll: Prisma.UserInclude;

	constructor(private readonly userService: UsersService) {
		this.userIncludeAll =
		{
			friends: true,
			friendTo: true,
			blacklist: true,
			blacklistedBy: true,
			matchHistory: true,
			playStats: true,
			channels: true,
			messages: true
		}
	}

	@Get('/me')
	@HttpCode(200)
	async getMe(@GetUser() user: User)
	{
		// console.log(user);
		return (user);
	}

	@Get('/me/complete')
	@HttpCode(200)
	async getFullProfile(@GetUser('id') id: string) {
		const res = await this.userService.userModal({ id }, this.userIncludeAll);
		if (!res) {
			throw (new NotFoundException(`Cannot find user with id: ${id}`));
		}
		return (res);
	}

	@Get('/me/modal')
	@HttpCode(200)
	async getMeModalProfile(@GetUser('id') id: string, @Query() include: UserIncludeQueryDto)
	{
		// console.log(include);
		const res = await this.userService.userModal({id}, include)
		if (!res) {
			throw (new NotFoundException(`Cannot find user with id: ${id}`));
		}
		return (res);
	}

	@Get()
	async findAll()
	{
		const res = await this.userService.users({});
		//if (!res)
		// error handling
		return res;
	}

	@Get(':userName')
	async findOne(@Param('userName') userName: string)
	{
		const res = await this.userService.user({ userName });
		// error handling
		if (!res) {
			throw (new NotFoundException(`Cannot find user with user name: ${userName}`));
		}
		return res;
	}

	@Post()
	async create(@Body() dto: CreateUserDto)
	{
		const res = await this.userService.createUser(dto);
		return res;
	}

	@Patch(':userName')
	async update(@Body() dto: UpdateUserDto, @Param('userName') userName: string)
	{
		const data: Prisma.UserUpdateInput = { ...dto };
		const res = await this.userService.updateUser({
			where: { userName },
			data
		});
		// error handling
		return res;
	}
}
