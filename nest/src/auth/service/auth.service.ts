import { Injectable, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { JwtPayload } from '../interface/jwtpayload.dto';

@Injectable()
export class AuthService
{
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService) { }

	async login(profile42: any)
	{
		const { id42, userName, email, image } = profile42;
		const avatar = image.link;
		let user: User = await this.usersService.user({ id42 });
		if (!user)
		{
			user = await this.usersService.createUser({ id42, userName, email, avatar});
		}
		const token = await this.signToken({ id: user.id })
		return { token, twoFaEnabled: user.twoFaEnabled };
	}

	async fakeLogin(fakeInfos: {id42: number, userName: string, email: string, avatar: string })
	{
		const {userName} = fakeInfos;
		let user: User = await this.usersService.user({userName});
		if (!user)
		{
			user = await this.usersService.createUser(fakeInfos);
		}
		const token = await this.signToken({ id: user.id })
		return { token };
	}

	async signToken(payload: JwtPayload): Promise<string>
	{
		const secret = process.env.JWT_SECRET;
		const token = await this.jwtService.signAsync(payload,
			{
				expiresIn: "7d",
				secret: secret
			});
		return (token)
	}

	async setJwtCookies(res: any, token: any)
	{
		const date: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		res.cookie('jwt', token,
			{
				expires: date,
				overwrite: true,
			});
		res.cookie('jwtExpiration', Number(date),
			{
				expires: date,
				overwrite: true,
			});
	}
}
