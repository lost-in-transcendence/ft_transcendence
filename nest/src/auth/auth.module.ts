import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { Auth42Strategy } from './strategy/auth42.strategy';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TwofaModule } from './twofa.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { env } from 'process';
import { FirstStepAuthStrategy } from './strategy/first-step-auth.strategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: 
  [
    PassportModule, JwtModule.register({}),
    MailerModule.forRoot({
      transport: 'smtps://' + env.MAILERHOST_USER + ':' + env.MAILERHOST_PW + '@smtp.gmail.com',
      defaults: {
        from : '"AmalGAm-transcendance" <no-reply@no-reply.com>',
      },
       template: {
        dir: '/usr/src/app/src/auth/templates',
        adapter : new PugAdapter(),
        options: {
          strict: false,
        },
      },
    }),
    HttpModule,
  ],
  providers: [AuthService, Auth42Strategy, UsersService, FirstStepAuthStrategy],
  controllers: [AuthController],
  exports: [AuthService]

})
export class AuthModule {}
