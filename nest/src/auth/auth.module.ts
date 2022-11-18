import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { Auth42Strategy } from './strategy/auth42.strategy';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TwofaModule } from './twofa.module';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AuthService, Auth42Strategy, UsersService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]

})
export class AuthModule {}
