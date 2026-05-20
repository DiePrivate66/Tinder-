import { Module } from '@nestjs/common';
import { UsersApplicationModule } from './users-application.module';
import { UsersController } from './users.controller';
import { UsersMessageController } from './users.message.controller';

@Module({
  imports: [UsersApplicationModule],
  controllers: [UsersController, UsersMessageController],
  exports: [UsersApplicationModule],
})
export class UsersModule {}
