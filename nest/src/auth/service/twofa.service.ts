import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { UsersService } from 'src/users/users.service';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class TwofaService 
{
    constructor(private readonly usersService: UsersService, private readonly mailerService: MailerService) {}

    async generateSecret(user: User)
    {
        const secret = authenticator.generateSecret();
        const res = this.usersService.updateUser({where: {id: user.id}, data: {...user, twoFaSecret: secret}});
        if (!res)
        {
            throw new NotFoundException("User not found (2-FA)");
        }
        return (secret);
    }

    async authenticate(token: string, secret: string)
    {
        if (!secret)
        {
            throw new ForbiddenException("Bad credentials");
        }
        return authenticator.verify({token, secret});
    }

    async sendMail(user: User, token: string)
    {
        try{

            const ret = await this.mailerService.sendMail({
                to: user.email,
                from: '"AmalGAm-transcendance" <no-reply@no-reply.com>',
                subject: 'Transcendance Validation Token',
                template: 'sendCode',
                context: {
                    user: user.userName,
                    token: token,
                }
            })
            return ret;
        }
        catch (err)
        {
            throw new BadRequestException('Email not found');
        }
    }

    async toggle2fa(user: User)
    {
        if (user.twoFaEnabled)
        {
            const res = await this.usersService.updateUser({where: {id: user.id}, data: {...user, twoFaEnabled: false}});
            if (!res)
            {
                throw new NotFoundException("User not found (2-FA)");
            }
        }
        else
        {
            const res = await this.usersService.updateUser({where: {id: user.id}, data: {...user, twoFaEnabled: true}});
            if (!res)
            {
                throw new NotFoundException("User not found (2-FA)");
            }
        }
    }
}
