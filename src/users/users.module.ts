import { Module } from '@nestjs/common';
import { UsersApplicationModule } from './users-application.module';
import { UsersMessageController } from './users.message.controller';

@Module({
  imports: [UsersApplicationModule],
  controllers: [UsersMessageController],
  exports: [UsersApplicationModule],
})
export class UsersModule {}
