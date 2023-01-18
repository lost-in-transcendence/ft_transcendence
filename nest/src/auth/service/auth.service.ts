import { Injectable, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interface/jwtpayload.dto';
import * as fs from 'fs';
import { HttpService } from '@nestjs/axios';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthService
{
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private httpService: HttpService
		) { }

	async login(profile42: any)
	{
		const { id42, userName, email, image } = profile42;
		const avatarURL = image.link;
		let token: string = '';
		let twoFaEnabled: boolean = false;
		let newUser: boolean = false;
		let user: User = await this.usersService.user({ id42: id42.toString() });
		if (!user)
		{
			let validName = userName;
			for (let valid: Boolean = false, postfix : number = 0; valid !== true || postfix <= 1000 ; postfix++)
			{
				let nameDuplicate = await this.usersService.user({userName: validName});
				if (!nameDuplicate)
				{
					valid = true;
				}
				else
				{
					validName = userName + '_' + postfix.toString();
				}
			}
			user = await this.usersService.createUser({  id42: id42.toString(), userName: validName, email});
			const url = avatarURL;
			const filename = `./asset/avatars/${user.id}_${Date.now().toString()}_avatar.png`;
			const fileWriterStream = fs.createWriteStream(filename);
			const response = await this.httpService.axiosRef({
				url : url,
				method: 'GET',
				responseType: 'stream',
			});
			await response.data.pipe(fileWriterStream);
			const data: Prisma.UserUpdateInput = { id42: id42.toString(), userName: validName, email, avatarPath : filename};
			await this.usersService.updateUser({
				where: { id : user.id },
				data
			});
			newUser = true;
		}

		token = await this.signToken({ id: user.id })
		twoFaEnabled = user.twoFaEnabled;
		return { token, twoFaEnabled, newUser };
	}

	async fakeLogin(fakeInfos: {id42: string, userName: string, email: string, avatarPath: string })
	{
		const {userName, id42, email} = fakeInfos;
		let user: User = await this.usersService.user({userName});
		if (!user)
		{
			user = await this.usersService.createUser(fakeInfos);
			const filename = `./asset/Guest.png`;
			const data: Prisma.UserUpdateInput = { id42, userName, email, avatarPath : filename};
			await this.usersService.updateUser({
				where: { id : user.id },
				data
			});
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
				sameSite: 'lax'
			});
		res.cookie('jwtExpiration', Number(date),
			{
				expires: date,
				overwrite: true,
				sameSite: 'lax'
			});
	}
}
