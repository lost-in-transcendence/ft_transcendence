import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { JwtGuard } from 'src/auth42/guard/jwt.guard';
import { GetUser } from './decorator';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto'
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
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
	async getMe(@GetUser() user: User) {
		// console.log(user);
		return (user);
	}

	@Get('/me/complete')
	async getFullProfile(@GetUser('id') id: string) {
		const ret = await this.userService.getUserModal({ id }, this.userIncludeAll);
		if (!ret) {
			throw (new NotFoundException(`Cannot find user with id: ${id}`));
		}
		return (ret);
	}

	@Get()
	async findAll() {
		const res = await this.userService.users({});
		//if (!res)
		// error handling
		return res;
	}

	@Get(':userName')
	async findOne(@Param('userName') userName: string) {
		const res = await this.userService.user({ userName });
		// error handling
		return res;
	}

	@Post()
	async create(@Body() dto: CreateUserDto) {
		const res = await this.userService.createUser(dto);
		console.log({ res });
		return res;
	}

	@Patch(':userName')
	async update(@Body() dto: UpdateUserDto, @Param('userName') userName: string) {
		const data: Prisma.UserUpdateInput = { ...dto };
		const res = await this.userService.updateUser({
			where: { userName },
			data
		});
		// error handling
		return res;
	}
}
