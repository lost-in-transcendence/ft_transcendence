import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth42Strategy } from './strategy/auth42.strategy';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule],
  providers: [AuthService, Auth42Strategy, UsersService],
  controllers: [AuthController],
  exports: [AuthService]

})
export class AuthModule {}
