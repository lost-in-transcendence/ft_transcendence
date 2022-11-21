import { Body, Controller, Get, HttpCode, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/users/decorator';
import { JwtGuard } from '../guard/jwt.guard';
import { TwofaService } from '../service/twofa.service';
import { authenticator } from 'otplib';
import { TwofaAuthenticationDto } from '../interface/twofa-authentication.dto';
import { JwtPayload } from '../interface/jwtpayload.dto';
import { AuthService } from '../service/auth.service';

@Controller('twofa')
export class TwofaController 
{
    constructor(private readonly twofaService: TwofaService, private readonly authService: AuthService) {}

    @UseGuards(JwtGuard)
    @Post('generate')
    @HttpCode(200)
    async generate(@GetUser() user)
    {
        const secret = await this.twofaService.generateSecret(user); // creates and logs secret in db
        authenticator.options =
            {
                digits: 6,
                step: 5 * 60
            };
        const token = authenticator.generate(secret);
        const date: Date = new Date(Date.now() + 800 * 60 * 1000);
        
        await this.twofaService.sendMail(user, token);
    }

    @UseGuards(JwtGuard)
    @Post('authenticate')
    @HttpCode(200)
    async authenticate(@Res({passthrough: true}) res, @GetUser() user, @Body() twofaAuthenticationDto: TwofaAuthenticationDto)
    {
        const authenticated = await this.twofaService.authenticate(twofaAuthenticationDto.token, user.twoFaSecret);
        if (!authenticated)
        {
            throw new UnauthorizedException("Wrong one!");
        }
        else
        {
            const payload : JwtPayload = {id: user.id, isTwoFaAuthenticated: true}
            const token = await this.authService.signToken(payload);
            await this.authService.setJwtCookies(res, token);
        }
        res.send();
    }
}
