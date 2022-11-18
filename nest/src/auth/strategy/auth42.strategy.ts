import {PassportStrategy} from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { Strategy as Strategy42 } from 'passport-42'
import { identity } from 'rxjs';
import { AuthService } from '../service/auth.service';

export class Auth42Strategy extends PassportStrategy(Strategy42, '42')
{
    constructor()
    {
        super({
            clientID: process.env.FORTYTWO_ID,
            clientSecret: process.env.FORTYTWO_SECRET,
            callbackURL: process.env.FORTYTWO_CALLBACK,
            profileFields: 
            {
                id42: 'id',
                userName: 'login',
                email: 'email',
                avatar: 'image_url',
            }

        });
    }

    validate(accessToken: string, refreshToken: string, profile: any) : any
    {
        return profile;
    }
}