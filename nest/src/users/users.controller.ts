import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {CreateUserDto, UpdateUserDto} from './dto/users.dto'
import { UsersService } from './users.service';

@Controller('users')
export class UsersController
{
    constructor(private readonly userService: UsersService) {}

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
        const {password, ...temp} = dto;
        // const passwordHash = argon2.hash(password);
        const passwordHash = password;
        const data : Prisma.UserCreateInput = {...temp, passwordHash: passwordHash}
        data.playStats = { 
            create: {}
        }
        const res = await this.userService.createUser(data);
        return res;
    }

    @Patch(':userName')
    async update(@Body() dto: UpdateUserDto, @Param('userName') userName: string)
    {
        const {password, ...temp} = dto;
        const data: Prisma.UserUpdateInput = {...temp};
        if (password)
        {
            const passwordHash = password;
            data.passwordHash = passwordHash;
        }
        const res = await this.userService.updateUser({
            where: {userName},
            data
        });
        //error handling
        return res;
    }
}
