import { BadRequestException, Body, Controller, Get, HttpCode, NotFoundException, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/users/decorator';
import { FirstStepAuthGuard } from '../guard/first-step-auth.guard';
import { TwofaService } from '../service/twofa.service';
import { authenticator } from 'otplib';
import { TwofaAuthenticationDto } from '../interface/twofa-authentication.dto';
import { JwtPayload } from '../interface/jwtpayload.dto';
import { AuthService } from '../service/auth.service';
import { FullAuthGuard } from '../guard/full-auth.guard';

@Controller('twofa')
export class TwofaController 
{
    constructor(private readonly twofaService: TwofaService, private readonly authService: AuthService) {}

    @UseGuards(FirstStepAuthGuard)
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
        
        try {
            await this.twofaService.sendMail(user, token);
        }
        catch (err)
        {
            throw new BadRequestException('Email not found');
        }
    }

    @UseGuards(FirstStepAuthGuard)
    @Post('authenticate')
    @HttpCode(200)
    async authenticate(@Res() res, @GetUser() user, @Body() twofaAuthenticationDto: TwofaAuthenticationDto)
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

    @UseGuards(FullAuthGuard)
    @Post('toggle')
    @HttpCode(200)
    async toggleTwoFa(@GetUser() user)
    {
        await this.twofaService.toggle2fa(user);
    }
}