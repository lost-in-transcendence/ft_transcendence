import { Controller, Get, UseGuards, Req, Res, HttpCode } from '@nestjs/common';
import { GetUser } from 'src/users/decorator';
import { AuthService } from './auth.service';
import { Auth42Guard } from './guard/auth42.guard';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController
{
    constructor (private readonly authService: AuthService) {}
    
    @UseGuards(Auth42Guard)
    @Get('login')
    async login (@Req() req, @Res() response)
    {
        const token = await this.authService.login(req.user);
        const date: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        response.cookie('jwt', token,
        {
            expires: date
        });
        response.cookie('jwtExpiration', date.getTime(),
        {
            expires: date
        });
        response.send()
    }

    @UseGuards(JwtGuard)
    @HttpCode(200)
    @Get('validate')
    async refresh(@Req() req, @Res() resp, @GetUser() user)
    {
        const {jwtExpiration} = req.cookies;
        const timeRemaining = Number(jwtExpiration) - Date.now();
		if (timeRemaining < 24 * 60 * 60 * 1000 && timeRemaining> 0) 
        {
            const token = await this.authService.signToken(user.id);
            const date : Date = new Date (Date.now() + 7 * 24 * 60 * 60 * 1000);
            resp.cookie('jwt', token,
            {
                expires: date,
                overwrite: true,
            });
            resp.cookie('jwtExpiration', Number(date),
            {
                expires: date,
                overwrite: true,
            });
        }
        resp.send();
    }

    @Get('logout')
    async logout (@Res() res)
    {
        res.cookie('jwt', 'none',
        {
            expires: new Date(Date.now())
        });
        res.cookie('jwtExpiration', 'none',
        {
            expires: new Date(Date.now())
        });
        res.status(302).redirect("http://localhost:3000/");
    }
}
