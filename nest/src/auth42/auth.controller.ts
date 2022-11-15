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
            expires: new Date(Date.now() + 10 * 60 * 1000)
        });
        // console.log("what the fuck");
        // return response;
        // response.status(201);
        response.send( "Cookie Set"
            // {
            //     success: true,
            //     token,
            // }
        )
        // return token;
    }

    // @UseGuards(Auth42Guard)
    @Get('logout')
    async logout (@Res() res)
    {
        res.cookie('jwt', 'none',
        {
            expires: new Date(Date.now() /*+ 1 * 500*/)
        });
        res.status(302).redirect("http://localhost:3000/");
    }
}
