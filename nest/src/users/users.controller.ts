import { Body, Controller, Get, HttpCode, Logger, NotFoundException, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma, User } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { FullAuthGuard } from 'src/auth/guard/full-auth.guard';
import { GetUser } from './decorator';
import { CreateUserDto, UpdateUserDto, UserIncludeQueryDto } from './dto/users.dto'
import { UsersService } from './users.service';
import { Express, Response } from 'express'
import { diskStorage } from 'multer';

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
		// console.log(user);
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
		// console.log(include);
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
		console.log(dto);
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
				const userId: string = req.params.id;
				console.debug({ file });
				return (cb(null, `${userId}_${Date.now().toString()}_${file.originalname}`));
			},
			destination: 'asset/avatars'
		})
	}))
	async uploadFile(@UploadedFile() avatar: Express.Multer.File, @GetUser() user, @Body() dto: UpdateUserDto) {
		console.log(avatar);
		this.logger.debug(`avatarPath : ${avatar.path}`);
		const data: Prisma.UserUpdateInput = { ...dto, avatarURL: 'http://localhost:3333/users/avatars/' + user.id, avatarPath : avatar.path};
		const res = await this.userService.updateUser({
			where: { id : user.id },
			data
		});
		//check la validité du fichier puis rm
		
	}

	@Get('/avatars/:id')
	async getAvatar(@Param('id') id, @Res() res: Response) {
		const user = await this.userService.user({id})
		this.logger.debug('in avatars/:id ROUTE');
		this.logger.debug(`avatarPath : ${user.avatarPath}`);
		if (user.avatarPath)
		{
			res.sendFile(user.avatarPath, { root: './' });
		}
		// res.sendFile('asset/avatars/3606040d-b407-4700-b139-2752824c2c36_1669567651366_logo.png', { root: './' });
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
}
