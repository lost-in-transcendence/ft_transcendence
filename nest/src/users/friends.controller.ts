import { Body, Controller, Get, HttpCode, Patch, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { FullAuthGuard } from "src/auth/guard/full-auth.guard";
import { GetUser } from "./decorator";
import { UpdateFriendsDto } from "./dto/friends.dto";
import { UsersService } from "./users.service";

@Controller('friends')
export class FriendsController
{
    constructor(private readonly userService: UsersService) {}

	@UseGuards(FullAuthGuard)
	@Patch('add')
	@HttpCode(200)
    async addFriend(@GetUser() user: User, @Body() dto : UpdateFriendsDto)
    {
        if (user.id === dto.userId)
        {
            throw new Error("You can't add yourself as a friend");
        }
        return await this.userService.updateUser({
            where: 
            {
                id: user.id,
            },
            data:
            {
                friends:
                {
                    connect:
                    {
                        id: dto.userId,
                    }
                }
            }
        })
    }

    @UseGuards(FullAuthGuard)
    @Patch('remove')
    @HttpCode(200)
    async removeFriend(@GetUser() user: User, @Body() dto: UpdateFriendsDto)
    {
        if (user.id === dto.userId)
        {
            return ;
        }
        return await this.userService.updateUser({
            where:
            {
                id: user.id,
            },
            data:
            {
                friends:
                {
                    disconnect:
                    {
                        id: dto.userId
                    }
                }
            }
        })
    }

    @UseGuards(FullAuthGuard)
    @Get()
    @HttpCode(200)
    async friendList(@GetUser() user: User)
    {
        return await this.userService.userSelect(
            {id: user.id},
            {friends: true},
        )
    }

    @UseGuards(FullAuthGuard)
    @Get('check')
    @HttpCode(200)
    async checkFriends(@GetUser() user: User, @Body() dto: UpdateFriendsDto)
    {
        if (user.id === dto.userId)
            return ;
        const friendlist = await this.userService.userSelect(
            {id: user.id},
            {friends:
            {
                where:
                {
                    id: dto.userId
                }
            }}
        );
        return friendlist;
    }
}