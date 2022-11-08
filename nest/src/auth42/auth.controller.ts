import { Controller, Post, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
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
        const res = await this.authService.login(req.user);
        response.status(302).redirect("http://localhost:3000/home");

    }
}
