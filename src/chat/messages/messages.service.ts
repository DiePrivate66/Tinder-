import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessage, MessageStatus, MessageType } from '../../../generated/prisma/chat';
import { ChatPrismaService } from '../../prisma/chat-prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

export interface ChatMessageView {
  id: number;
  conversationId: number;
  senderUserId: number;
  body: string;
  messageType: MessageType;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: ChatPrismaService) {}

  async sendMessage(dto: SendMessageDto): Promise<ChatMessageView> {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: {
        id: dto.conversationId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    if (
      dto.senderUserId !== conversation.participantOneId &&
      dto.senderUserId !== conversation.participantTwoId
    ) {
      throw new ForbiddenException(
        'Sender does not belong to this conversation.',
      );
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: dto.conversationId,
        senderUserId: dto.senderUserId,
        body: dto.body.trim(),
      },
    });

    return this.toMessageView(message);
  }

  async listMessagesByConversation(
    conversationId: number,
  ): Promise<ChatMessageView[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map((message) => this.toMessageView(message));
  }

  private toMessageView(message: ChatMessage): ChatMessageView {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderUserId: message.senderUserId,
      body: message.body,
      messageType: message.messageType,
      status: message.status,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
