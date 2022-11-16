import { Controller, Post, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
import { GetUser } from 'src/users/decorator';
import { AuthService } from './auth.service';
import { TestGuard } from './decorator/testDecorator';
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
        console.log('entered login route in back');
        const token = await this.authService.login(req.user);
        const date: Date = new Date(Date.now() + /*7 * 24 * 60 *  60 (uncomment this and remove the 10 for prod)*/ 5 * 60 * 1000);
        // console.log(date.getTime());
        response.cookie('jwt', token,
        {
            expires: date
        });
        response.cookie('jwtExpiration', date.getTime(),
        {
            expires: date
        });
        // console.log("what the fuck");
        // return response;
        // response.status(201);
        response.send( /*"Cookie Set"*/
            // {
            //     success: true,
            //     token,
            // }
        )
        // return token;
    }

    // @UseGuards(Auth42Guard)
    @UseGuards(JwtGuard)
    @Get('refresh')
    async refresh(@Req() req, @Res() resp, @GetUser() user)
    {
        console.log('entered refresh route in back');
        // console.log(user.id);
        // console.log(response);
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
        console.log('leaving refresh route in back')
        resp.send();
        // response.status(302).redirect("http://localhost:3000/home");
    }

    // @UseGuards(Auth42Guard)
    @Get('logout')
    async logout (@Res() res)
    {
        res.cookie('jwt', 'none',
        {
            expires: new Date(Date.now() /*+ 1 * 500*/)
        });
        res.cookie('jwtExpiration', 'none',
        {
            expires: new Date(Date.now() /*+ 1 * 500*/)
        });
        res.status(302).redirect("http://localhost:3000/");
    }
}
