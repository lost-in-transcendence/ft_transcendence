import { Injectable, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService
{
    constructor (
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService) {}

    async login(profile42: any)
    {
        const {id42, userName, email, avatar} = profile42;
        let user: User = await this.usersService.user({id42});
        if (!user)
        {
            user = await this.usersService.createUser({id42, userName, email, avatar});
        }
        const token = await this.signToken(user.id)
        return token;
    }

    async signToken(userId: string) : Promise<string>
    {
        const payload = {sub: userId};
        // const secret = this.config.get('JWT_SECRET');
        const secret = process.env.JWT_SECRET;
        // console.log(secret);
        const token = await this.jwtService.signAsync(payload, 
            {
                expiresIn: "1m",
                secret: secret
            });
        return (token)
    }
}
