import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ChannelsModule } from './chat/channels/channels.module';
import { TwofaModule } from './auth/twofa.module';
import { MainGateway } from './websocket-server/main.gateway';
import { WebsocketModule } from './websocket-server/websocket.module';

@Module({
  imports: [PrismaModule, UsersModule, ChannelsModule, AuthModule, ChatModule, TwofaModule, WebsocketModule/*, ConfigModule.forRoot({isGlobal: true}) */],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
