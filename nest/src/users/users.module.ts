import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FriendsController } from './friends.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // imports: [MulterModule.registerAsync({
  //   useFactory: () => ({
  //     dest: './asset'
  //   })
  // })],
  controllers: [UsersController, FriendsController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
