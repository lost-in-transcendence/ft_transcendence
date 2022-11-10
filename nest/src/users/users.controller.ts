import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { JwtGuard } from 'src/auth42/guard/jwt.guard';
import { GetUser } from './decorator';
import {CreateUserDto, UpdateUserDto} from './dto/users.dto'
import { UsersService } from './users.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController
{
    constructor(private readonly userService: UsersService) {}

    @Get('/me')
    async getMe(@GetUser() user: User)
    {
        // console.log(user);
        return (user);
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
        const res = await this.userService.user( {userName});
        // error handling
        return res;
    }

    @Post()
    async create(@Body() dto: CreateUserDto)
    {
        const data : Prisma.UserCreateInput = {...dto};
        data.playStats = { 
            create: {}
        }
        const res = await this.userService.createUser(data);
        return res;
    }

    @Patch(':userName')
    async update(@Body() dto: UpdateUserDto, @Param('userName') userName: string)
    {
        const data: Prisma.UserUpdateInput = {...dto};
        const res = await this.userService.updateUser({
            where: {userName},
            data
        });
        // error handling
        return res;
    }
}
