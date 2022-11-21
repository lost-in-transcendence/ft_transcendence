import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { Auth42Strategy } from './strategy/auth42.strategy';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TwofaModule } from './twofa.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { env } from 'process';

@Module({
  imports: [PassportModule, JwtModule.register({}),
    MailerModule.forRoot({
      transport: 'smtps://' + env.MAILERHOST_USER + ':' + env.MAILERHOST_PW + '@smtp.gmail.com',
      defaults: {
        from : '"no-reply" <ft.transcendance.amalgam@gmail.com>',
      },
       template: {
        dir: '/usr/src/app/src/auth/templates',
        adapter : new PugAdapter(),
        options: {
          strict: false,
        },
      },
    }),
  ],
  providers: [AuthService, Auth42Strategy, UsersService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]

})
export class AuthModule {}
