import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth42/auth.module';

@Module({
  imports: [PrismaModule, UsersModule, ChannelsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
