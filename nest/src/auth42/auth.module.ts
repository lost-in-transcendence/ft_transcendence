import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth42Strategy } from './strategy/auth42.strategy';

@Module({
  providers: [AuthService, Auth42Strategy],
  controllers: [AuthController],

})
export class AuthModule {}
