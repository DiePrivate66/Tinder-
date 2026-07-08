import { Module } from '@nestjs/common';
import { ChatPersistenceModule } from '../chat-persistence.module';
import { MessagesService } from './messages.service';

@Module({
  imports: [ChatPersistenceModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
