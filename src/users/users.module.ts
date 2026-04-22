import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USERS_REPOSITORY } from './domain/users.repository.port';
import { PrismaUsersRepository } from './infrastructure/prisma-users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [
    UsersService,
    PrismaService,
    PrismaUsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: PrismaUsersRepository,
    },
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
