import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageStatus, MessageType } from '../../../generated/prisma/chat';
import { ChatPrismaService } from '../../prisma/chat-prisma.service';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  const chatConversationDelegate = {
    findUnique: jest.fn(),
  };

  const chatMessageDelegate = {
    create: jest.fn(),
    findMany: jest.fn(),
  };

  let service: MessagesService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new MessagesService({
      chatConversation: chatConversationDelegate,
      chatMessage: chatMessageDelegate,
    } as unknown as ChatPrismaService);
  });

  it('rejects sending a message when the conversation does not exist', async () => {
    chatConversationDelegate.findUnique.mockResolvedValue(null);

    await expect(
      service.sendMessage({
        conversationId: 1,
        senderUserId: 10,
        body: 'Hola',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects sending a message when the sender is not part of the conversation', async () => {
    chatConversationDelegate.findUnique.mockResolvedValue({
      id: 1,
      participantOneId: 2,
      participantTwoId: 5,
    });

    await expect(
      service.sendMessage({
        conversationId: 1,
        senderUserId: 99,
        body: 'Hola',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates and returns the message when the sender belongs to the conversation', async () => {
    chatConversationDelegate.findUnique.mockResolvedValue({
      id: 1,
      participantOneId: 2,
      participantTwoId: 5,
    });
    chatMessageDelegate.create.mockResolvedValue({
      id: 7,
      conversationId: 1,
      senderUserId: 2,
      body: 'Hola mundo',
      messageType: MessageType.TEXT,
      status: MessageStatus.SENT,
      createdAt: new Date('2026-07-06T00:00:00.000Z'),
      updatedAt: new Date('2026-07-06T00:00:00.000Z'),
    });

    const result = await service.sendMessage({
      conversationId: 1,
      senderUserId: 2,
      body: '  Hola mundo  ',
    });

    expect(chatMessageDelegate.create).toHaveBeenCalledWith({
      data: {
        conversationId: 1,
        senderUserId: 2,
        body: 'Hola mundo',
      },
    });
    expect(result).toMatchObject({
      id: 7,
      senderUserId: 2,
      body: 'Hola mundo',
      status: MessageStatus.SENT,
    });
  });
});
