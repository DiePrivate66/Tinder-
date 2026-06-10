import { Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/permissions.guard';
import { UsersController } from './users.controller';
import { UsersApplicationModule } from './users-application.module';

@Module({
  imports: [UsersApplicationModule],
  controllers: [UsersController],
  providers: [PermissionsGuard],
  exports: [UsersApplicationModule],
})
export class UsersModule {}
