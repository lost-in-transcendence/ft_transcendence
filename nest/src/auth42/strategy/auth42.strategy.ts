import {PassportStrategy} from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { Strategy as Strategy42 } from 'passport-42'
import { identity } from 'rxjs';
import { AuthService } from '../auth.service';

export class Auth42Strategy extends PassportStrategy(Strategy42, '42')
{
    constructor(private readonly authService: AuthService, private readonly prisma: PrismaClient)
    {
        super({
            clientID: 'u-s4t2ud-5787f8a42123180cf85cfb3b16931243bf86682177210c4337bc136e3f82aadd',
            clientSecret: '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',
            callbackURL: 'https://www.twitch.tv/amouranth',
            profileFields: {
                // 'id': 'id',
                userName: 'login',
                email: 'email',
                avatar: 'image_url',
            }

        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, cb: Function)
    {
        console.log(profile);
        return "bonjour";
    }
}