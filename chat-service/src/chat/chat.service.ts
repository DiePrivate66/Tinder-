import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ChatConversation, ConversationStatus } from '../../generated/prisma';
import { ChatPrismaService } from '../prisma/chat-prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

export interface ChatConversationView {
  id: number;
  participantOneId: number;
  participantTwoId: number;
  counterpartUserId?: number;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: ChatPrismaService) {}

  health() {
    return {
      service: 'chat',
      status: 'ok',
    };
  }

  async createConversation(
    dto: CreateConversationDto,
  ): Promise<ChatConversationView> {
    const [participantOneId, participantTwoId] = this.normalizeParticipants(
      dto.participantAId,
      dto.participantBId,
    );

    const existingConversation = await this.prisma.chatConversation.findUnique({
      where: {
        participantOneId_participantTwoId: {
          participantOneId,
          participantTwoId,
        },
      },
    });

    if (existingConversation) {
      return this.toConversationView(existingConversation);
    }

    const conversation = await this.prisma.chatConversation.create({
      data: {
        participantOneId,
        participantTwoId,
      },
    });

    return this.toConversationView(conversation);
  }

  async listConversationsByUserId(
    userId: number,
  ): Promise<ChatConversationView[]> {
    const conversations = await this.prisma.chatConversation.findMany({
      where: {
        OR: [
          { participantOneId: userId },
          { participantTwoId: userId },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return conversations.map((conversation) =>
      this.toConversationView(conversation, userId),
    );
  }

  private normalizeParticipants(
    participantAId: number,
    participantBId: number,
  ): [number, number] {
    if (participantAId === participantBId) {
      throw new UnprocessableEntityException(
        'A conversation requires two different users.',
      );
    }

    return participantAId < participantBId
      ? [participantAId, participantBId]
      : [participantBId, participantAId];
  }

  private toConversationView(
    conversation: ChatConversation,
    currentUserId?: number,
  ): ChatConversationView {
    return {
      id: conversation.id,
      participantOneId: conversation.participantOneId,
      participantTwoId: conversation.participantTwoId,
      counterpartUserId:
        currentUserId === undefined
          ? undefined
          : currentUserId === conversation.participantOneId
            ? conversation.participantTwoId
            : conversation.participantOneId,
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
