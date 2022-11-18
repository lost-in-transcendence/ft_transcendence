import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TwofaModule } from './auth/twofa.module';

@Module({
  imports: [PrismaModule, UsersModule, ChannelsModule, AuthModule, TwofaModule/*, ConfigModule.forRoot({isGlobal: true}) */],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
