
import { Body, Controller,Delete, Get, HttpCode, Logger, MaxFileSizeValidator, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma, User } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { FullAuthGuard } from 'src/auth/guard/full-auth.guard';
import { GetUser } from './decorator';
import { CreateUserDto, UpdateUserDto, UserIncludeQueryDto } from './dto/users.dto'
import { UsersService } from './users.service';
import { Express, Response } from 'express'
import { diskStorage } from 'multer';
import * as fs from 'fs'

// @UseGuards(FullAuthGuard)
@Controller('users')
export class UsersController {
	private readonly logger = new Logger(UsersController.name);
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

	
	@UseGuards(FullAuthGuard)
	@Get('/me')
	@HttpCode(200)
	async getMe(@GetUser() user: User) {
		return (user);
	}

	@UseGuards(FullAuthGuard)
	@Get('/me/complete')
	@HttpCode(200)
	async getFullProfile(@GetUser('id') id: string) {
		const res = await this.userService.userModal({ id }, this.userIncludeAll);
		if (!res) {
			throw (new NotFoundException(`Cannot find user with id: ${id}`));
		}
		return (res);
	}

	@UseGuards(FullAuthGuard)
	@Get('/me/modal')
	@HttpCode(200)
	async getMeModalProfile(@GetUser('id') id: string, @Query() include: UserIncludeQueryDto) {
		const res = await this.userService.userModal({ id }, include)
		if (!res) {
			throw (new NotFoundException(`Cannot find user with id: ${id}`));
		}
		return (res);
	}

	@UseGuards(FullAuthGuard)
	@Get()
	async findAll() {
		const res = await this.userService.users({});
		//if (!res)
		// error handling
		return res;
	}

	
	@UseGuards(FullAuthGuard)
	@Post()
	async create(@Body() dto: CreateUserDto) {
		const res = await this.userService.createUser(dto);
		return res;
	}

	@UseGuards(FullAuthGuard)
	@Patch()
	async update(@Body() dto: UpdateUserDto, @GetUser('id') id) {
		const data: Prisma.UserUpdateInput = { ...dto };
		const res = await this.userService.updateUser({
			where: { id },
			data
		});
		// error handling
		return res;
	}

	@UseGuards(FullAuthGuard)
	@Post('/avatar/:id')
	@UseInterceptors(FileInterceptor('avatar', {
		storage: diskStorage({
			filename: (req, file, cb) => {
				const userId: string = req.params.id.split('-').join('');
				return (cb(null, `${userId}_${Date.now().toString()}_${file.originalname}`));
			},
			destination: 'asset/avatars'
		})
	}))
	async uploadFile(@UploadedFile() avatar: Express.Multer.File, @GetUser() user, @Body() dto: UpdateUserDto) {
		const oldAvatar = user.avatarPath;
		const data: Prisma.UserUpdateInput = { ...dto, avatarPath : avatar.path};
		const res = await this.userService.updateUser({
			where: { id : user.id },
			data
		});
		fs.unlinkSync(oldAvatar);
	}

	@Get('/avatars/:userName')
	async getAvatar(@Param('userName') userName, @Res() res: Response) {
		const user = await this.userService.user({userName})
		if (user.avatarPath)
		{
			res.sendFile(user.avatarPath, { root: './' });
		}
	}

	@UseGuards(FullAuthGuard)
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

	@Delete()
	async delete(@GetUser('id', ParseUUIDPipe) userId: string)
	{
		return this.userService.deleteUser({id: userId});
	}
}
