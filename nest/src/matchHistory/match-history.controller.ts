import { Body, Controller, Get, HttpCode, Logger, Param, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { FullAuthGuard } from "src/auth/guard/full-auth.guard";
import { GetUser } from "src/users/decorator";
import { UsersService } from "src/users/users.service";
import { MatchHistoryService } from "./match-history.service";

@Controller('match-history')
export class MatchHistoryController
{
    private readonly logger = new Logger(MatchHistoryController.name);
    constructor (private readonly matchHistoryService: MatchHistoryService, 
        private readonly usersService: UsersService)
    {

    }

    @UseGuards(FullAuthGuard)
    @Get('/me')
    @HttpCode(200)
    async getMyMatchHistory(@GetUser() user: User)
    {
        return await this.matchHistoryService.getUserMatchHistory(user.id)
    }

    @UseGuards(FullAuthGuard)
    @Get("/:userId")
    @HttpCode(200)
    async getMatchHistory(@Param('userId', new ParseUUIDPipe) userId: string)
    {
        return await this.matchHistoryService.getUserMatchHistory(userId);
    }
}