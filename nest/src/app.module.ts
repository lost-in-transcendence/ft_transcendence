import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth42/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, UsersModule, ChannelsModule, AuthModule/*, ConfigModule.forRoot({isGlobal: true}) */],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
