import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  // imports: [MulterModule.registerAsync({
  //   useFactory: () => ({
  //     dest: './asset'
  //   })
  // })],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
