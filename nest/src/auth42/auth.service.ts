import { Injectable, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService
{
    constructor (private readonly usersService: UsersService) {}

    async login(profile42: any)
    {
        const {id42, userName, email, avatar} = profile42;
        let user = await this.usersService.user({id42});
        if (!user)
        {
            user = await this.usersService.createUser({id42, userName, email, avatar});
        }
        return user;
    }
}
