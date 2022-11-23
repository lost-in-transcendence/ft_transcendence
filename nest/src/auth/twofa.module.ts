import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from './auth.module';
import { TwofaController } from './controller/twofa.controller';
import { AuthService } from './service/auth.service';
import { TwofaService } from './service/twofa.service';
import { FullAuthStrategy } from './strategy/full-auth.strategy';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [TwofaController],
  providers: [TwofaService, FullAuthStrategy]
})
export class TwofaModule {}
