import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ChatService } from './chat.service';
import { SendMessageDto } from './messages/dto/send-message.dto';
import { MessagesService } from './messages/messages.service';

interface WithUserId<TDto = undefined> {
  userId: number;
  dto?: TDto;
}

interface WithConversationAccess {
  userId: number;
  conversationId: number;
}

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
  createConversation(@Payload() payload: WithUserId<{ counterpartUserId: number }>) {
    const counterpartUserId = payload.dto?.counterpartUserId;
    if (counterpartUserId === undefined) {
      throw new Error('counterpartUserId is required');
    }

    const dto: CreateConversationDto = {
      participantAId: payload.userId,
      participantBId: counterpartUserId,
    };

    return this.chatService.createConversation(dto);
  }

  @MessagePattern(RpcPatterns.chat.listConversationsByUserId)
  listConversationsByUserId(@Payload() userId: number) {
    return this.chatService.listConversationsByUserId(userId);
  }

  @MessagePattern(RpcPatterns.chat.sendMessage)
  sendMessage(
    @Payload()
    payload: WithUserId<{ conversationId: number; body: string }>,
  ) {
    const conversationId = payload.dto?.conversationId;
    const body = payload.dto?.body;

    if (conversationId === undefined || body === undefined) {
      throw new Error('Message payload is required');
    }

    const dto: SendMessageDto = {
      conversationId,
      senderUserId: payload.userId,
      body,
    };

    return this.messagesService.sendMessage(dto);
  }

  @MessagePattern(RpcPatterns.chat.listMessagesByConversation)
  listMessagesByConversation(@Payload() payload: WithConversationAccess) {
    return this.messagesService.listMessagesByConversation(
      payload.userId,
      payload.conversationId,
    );
  }
}
