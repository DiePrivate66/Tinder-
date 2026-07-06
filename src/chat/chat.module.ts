import { Module } from '@nestjs/common';
import { ChatMessageController } from './chat.message.controller';
import { ChatPersistenceModule } from './chat-persistence.module';
import { ChatService } from './chat.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [ChatPersistenceModule, MessagesModule],
  controllers: [ChatMessageController],
  providers: [ChatService],
  exports: [ChatService, MessagesModule],
})
export class ChatModule {}
