import { Controller, Get, UseGuards, Req, Res, HttpCode, Body, Post } from '@nestjs/common';
import { GetUser } from 'src/users/decorator';
import { AuthService } from '../service/auth.service';
import { Auth42Guard } from '../guard/auth42.guard';
import { FAKE_IMG_URL } from 'asset';
import { env } from 'process';
import { FullAuthGuard } from '../guard/full-auth.guard';

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
		res.send(
			{
				twoFaEnabled,
			}
		)
	}

	@UseGuards(FullAuthGuard)
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
	}

	@Post('dev-signup')
	devAuth(@Body() fakeInfos: {id42: number, userName: string, email: string, avatarURL: any})
	{
		fakeInfos.avatarURL = FAKE_IMG_URL;
		return (this.authService.fakeLogin(fakeInfos));
	}
}
