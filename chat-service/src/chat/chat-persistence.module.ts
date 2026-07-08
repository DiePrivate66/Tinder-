import { Module } from '@nestjs/common';
import { ChatPrismaService } from '../prisma/chat-prisma.service';

@Module({
  providers: [ChatPrismaService],
  exports: [ChatPrismaService],
})
export class ChatPersistenceModule {}
