import { Controller, Post, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
import { response } from 'express';
import { AuthService } from './auth.service';
import { TestGuard } from './decorator/testDecorator';
import { Auth42Guard } from './guard/auth42.guard';

@Controller('auth')
export class AuthController
{
    constructor (private readonly authService: AuthService) {}
    
    @UseGuards(Auth42Guard)
    @Get('login')
    async login (@Req() req, @Res() response)
    {
        const token = await this.authService.login(req.user);
        response.cookie('jwt', token,
        {
            expires: new Date(Date.now() + 1 * 60 * 1000)
        });
        response.status(302).redirect("http://localhost:3000/home");
    }

    // @UseGuards(Auth42Guard)
    @Get('logout')
    async logout (@Res() res)
    {
        console.log(res.location);
        res.cookie('jwt', 'none',
        {
            expires: new Date(Date.now() /*+ 1 * 500*/)
        });
        res.status(302).redirect("http://localhost:3000/");
    }
}
