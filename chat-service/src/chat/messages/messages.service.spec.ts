import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageStatus, MessageType } from '../../../generated/prisma';
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

  it('rejects listing messages when the user is not part of the conversation', async () => {
    chatConversationDelegate.findUnique.mockResolvedValue({
      id: 1,
      participantOneId: 2,
      participantTwoId: 5,
    });

    await expect(service.listMessagesByConversation(99, 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('lists messages when the user belongs to the conversation', async () => {
    chatConversationDelegate.findUnique.mockResolvedValue({
      id: 1,
      participantOneId: 2,
      participantTwoId: 5,
    });
    chatMessageDelegate.findMany.mockResolvedValue([
      {
        id: 10,
        conversationId: 1,
        senderUserId: 2,
        body: 'Hola',
        messageType: MessageType.TEXT,
        status: MessageStatus.SENT,
        createdAt: new Date('2026-07-06T00:00:00.000Z'),
        updatedAt: new Date('2026-07-06T00:00:00.000Z'),
      },
    ]);

    const result = await service.listMessagesByConversation(2, 1);

    expect(chatMessageDelegate.findMany).toHaveBeenCalledWith({
      where: {
        conversationId: 1,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    expect(result[0]).toMatchObject({
      id: 10,
      body: 'Hola',
    });
  });
});
