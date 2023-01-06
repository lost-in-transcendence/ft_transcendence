import { Body, Controller, ForbiddenException, Get, HttpCode, ParseUUIDPipe, Patch, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { FullAuthGuard } from "src/auth/guard/full-auth.guard";
import { GetUser } from "./decorator";
import { UsersService } from "./users.service";

@Controller('blacklist')
export class BlackListController
{
	constructor(private readonly userService: UsersService) { }

	@UseGuards(FullAuthGuard)
	@Patch('add')
	@HttpCode(200)
	async addToBlacklist(@GetUser() user: User, @Body('userId', ParseUUIDPipe) userId: string)
	{
		if (user.id === userId)
		{
			throw new ForbiddenException("You can't blacklist yourself !");
		}
		return await this.userService.updateUser({
			where:
			{
				id: user.id,
			},
			data:
			{
				blacklist: { connect: { id: userId } }
			}
		})
	}

	@UseGuards(FullAuthGuard)
	@Patch('remove')
	@HttpCode(200)
	async removeFromBlacklist(@GetUser() user: User, @Body('userId', ParseUUIDPipe) userId: string)
	{
		if (user.id === userId)
		{
			return;
		}
		return await this.userService.updateUser({
			where:
			{
				id: user.id,
			},
			data:
			{
				blacklist:
				{
					disconnect:
					{
						id: userId
					}
				}
			}
		})
	}

	@UseGuards(FullAuthGuard)
	@Get()
	@HttpCode(200)
	async blackList(@GetUser() user: User)
	{
		return await this.userService.userSelect(
			{ id: user.id },
			{ blacklist: true },
		)
	}

	@UseGuards(FullAuthGuard)
	@Get('check')
	@HttpCode(200)
	async checkFriends(@GetUser() user: User, @Body('userId', ParseUUIDPipe) userId: string)
	{
		if (user.id === userId)
			return;
		const friendlist = await this.userService.userSelect(
			{ id: user.id },
			{
				blacklist:
				{
					where:
					{
						id: userId
					}
				}
			}
		);
		return friendlist;
	}
}
