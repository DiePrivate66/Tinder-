import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ChatService } from './chat.service';
import { SendMessageDto } from './messages/dto/send-message.dto';
import { MessagesService } from './messages/messages.service';

@Controller()
export class ChatMessageController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messagesService: MessagesService,
  ) {}

  @MessagePattern(RpcPatterns.chat.health)
  health() {
    return this.chatService.health();
  }

  @MessagePattern(RpcPatterns.chat.createConversation)
  createConversation(@Payload() dto: CreateConversationDto) {
    return this.chatService.createConversation(dto);
  }

  @MessagePattern(RpcPatterns.chat.listConversationsByUserId)
  listConversationsByUserId(@Payload() userId: number) {
    return this.chatService.listConversationsByUserId(userId);
  }

  @MessagePattern(RpcPatterns.chat.sendMessage)
  sendMessage(@Payload() dto: SendMessageDto) {
    return this.messagesService.sendMessage(dto);
  }

  @MessagePattern(RpcPatterns.chat.listMessagesByConversation)
  listMessagesByConversation(@Payload() conversationId: number) {
    return this.messagesService.listMessagesByConversation(conversationId);
  }
}
