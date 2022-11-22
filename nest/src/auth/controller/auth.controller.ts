import { Controller, Get, UseGuards, Req, Res, HttpCode, Body, Post } from '@nestjs/common';
import { GetUser } from 'src/users/decorator';
import { AuthService } from '../service/auth.service';
import { Auth42Guard } from '../guard/auth42.guard';
import { JwtGuard } from '../guard/jwt.guard';
import { FAKE_IMG_URL } from 'asset';
import { env } from 'process';

@Controller('auth')
export class AuthController
{
	constructor(private readonly authService: AuthService) { }

	@UseGuards(Auth42Guard)
	@Get('login')
	@HttpCode(200)
	async login(@Req() req, @Res({ passthrough: true }) res)
	{
		const { token, twoFaEnabled } = await this.authService.login(req.user);
		await this.authService.setJwtCookies(res, token);
		// const date: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		// res.cookie('jwt', token,
		// {
		//     expires: date
		// });
		// res.cookie('jwtExpiration', date.getTime(),
		// {
		//     expires: date
		// });
		// return twoFaEnabled;
		res.send(
			{
				twoFaEnabled,
			}
		)
		// return ({twoFA: twoFaEnabled});
	}

	@UseGuards(JwtGuard)
	@HttpCode(200)
	@Get('validate')
	async refresh(@Req() req, @Res() res, @GetUser() user)
	{
		const { jwtExpiration } = req.cookies;
		const timeRemaining = Number(jwtExpiration) - Date.now();
		if (timeRemaining < 24 * 60 * 60 * 1000 && timeRemaining > 0)
		{
			const token = await this.authService.signToken(user.id);
			await this.authService.setJwtCookies(res, token);
		}
		res.send();
	}

	@Get('logout')
	async logout(@Res() res)
	{
		res.cookie('jwt', 'none',
			{
				expires: new Date(Date.now() + 1 * 1000)
			});
		res.cookie('jwtExpiration', 'none',
			{
				expires: new Date(Date.now() + 1 * 1000)
			});
		res.send();
		// res.status(302).redirect(`${env.PROTOCOL}${env.APP_HOST}:${env.FRONT_PORT}/`);
	}

	@Post('dev-signup')
	devAuth(@Body() fakeInfos: {id42: number, userName: string, email: string, avatar: any})
	{
		fakeInfos.avatar = FAKE_IMG_URL;
		return (this.authService.fakeLogin(fakeInfos));
	}
}
