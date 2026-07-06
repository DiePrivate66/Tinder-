import { UnprocessableEntityException } from '@nestjs/common';
import { ConversationStatus } from '../../generated/prisma/chat';
import { ChatPrismaService } from '../prisma/chat-prisma.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  const chatConversationDelegate = {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  };

  let service: ChatService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ChatService({
      chatConversation: chatConversationDelegate,
    } as unknown as ChatPrismaService);
  });

  it('rejects conversations with the same user twice', async () => {
    await expect(
      service.createConversation({ participantAId: 4, participantBId: 4 }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('normalizes the participant pair before creating the conversation', async () => {
    chatConversationDelegate.findUnique.mockResolvedValue(null);
    chatConversationDelegate.create.mockResolvedValue({
      id: 1,
      participantOneId: 3,
      participantTwoId: 9,
      status: ConversationStatus.ACTIVE,
      createdAt: new Date('2026-07-06T00:00:00.000Z'),
      updatedAt: new Date('2026-07-06T00:00:00.000Z'),
    });

    const result = await service.createConversation({
      participantAId: 9,
      participantBId: 3,
    });

    expect(chatConversationDelegate.findUnique).toHaveBeenCalledWith({
      where: {
        participantOneId_participantTwoId: {
          participantOneId: 3,
          participantTwoId: 9,
        },
      },
    });
    expect(result.participantOneId).toBe(3);
    expect(result.participantTwoId).toBe(9);
  });

  it('computes the counterpart user when listing conversations', async () => {
    chatConversationDelegate.findMany.mockResolvedValue([
      {
        id: 12,
        participantOneId: 5,
        participantTwoId: 8,
        status: ConversationStatus.ACTIVE,
        createdAt: new Date('2026-07-06T00:00:00.000Z'),
        updatedAt: new Date('2026-07-06T00:00:00.000Z'),
      },
    ]);

    const result = await service.listConversationsByUserId(5);

    expect(result[0]).toMatchObject({
      id: 12,
      counterpartUserId: 8,
      status: ConversationStatus.ACTIVE,
    });
  });
});
