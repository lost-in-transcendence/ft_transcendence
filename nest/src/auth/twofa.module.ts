import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from './auth.module';
import { TwofaController } from './controller/twofa.controller';
import { AuthService } from './service/auth.service';
import { TwofaService } from './service/twofa.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [TwofaController],
  providers: [TwofaService]
})
export class TwofaModule {}
