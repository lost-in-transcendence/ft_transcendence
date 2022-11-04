import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { Auth42Guard } from './guard/auth42.guard';

@Controller('auth')
export class AuthController
{
    @UseGuards(Auth42Guard)
    @Get('login')
    // async login (@Request() req)
    async login ()
    {
        // return req.user
    }
}
