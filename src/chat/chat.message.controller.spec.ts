import { ChatMessageController } from './chat.message.controller';
import { ChatService } from './chat.service';
import { MessagesService } from './messages/messages.service';

describe('ChatMessageController', () => {
  const chatService = {
    health: jest.fn(),
    createConversation: jest.fn(),
    listConversationsByUserId: jest.fn(),
  };

  const messagesService = {
    sendMessage: jest.fn(),
    listMessagesByConversation: jest.fn(),
  };

  let controller: ChatMessageController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ChatMessageController(
      chatService as unknown as ChatService,
      messagesService as unknown as MessagesService,
    );
  });

  it('maps the authenticated user and counterpart into the internal conversation dto', () => {
    chatService.createConversation.mockReturnValue({ id: 1 });

    const result = controller.createConversation({
      userId: 7,
      dto: { counterpartUserId: 11 },
    });

    expect(chatService.createConversation).toHaveBeenCalledWith({
      participantAId: 7,
      participantBId: 11,
    });
    expect(result).toEqual({ id: 1 });
  });

  it('rejects creating a conversation when counterpartUserId is missing', () => {
    expect(() =>
      controller.createConversation({
        userId: 7,
        dto: undefined,
      }),
    ).toThrow('counterpartUserId is required');
  });

  it('maps the authenticated user into the internal send-message dto', () => {
    messagesService.sendMessage.mockReturnValue({ id: 9 });

    const result = controller.sendMessage({
      userId: 5,
      dto: {
        conversationId: 22,
        body: 'hola',
      },
    });

    expect(messagesService.sendMessage).toHaveBeenCalledWith({
      conversationId: 22,
      senderUserId: 5,
      body: 'hola',
    });
    expect(result).toEqual({ id: 9 });
  });

  it('rejects sending a message when the payload is incomplete', () => {
    expect(() =>
      controller.sendMessage({
        userId: 5,
        dto: { conversationId: 22, body: undefined as unknown as string },
      }),
    ).toThrow('Message payload is required');
  });

  it('forwards the authenticated user and conversation id when listing messages', () => {
    messagesService.listMessagesByConversation.mockReturnValue([{ id: 1 }]);

    const result = controller.listMessagesByConversation({
      userId: 3,
      conversationId: 44,
    });

    expect(messagesService.listMessagesByConversation).toHaveBeenCalledWith(
      3,
      44,
    );
    expect(result).toEqual([{ id: 1 }]);
  });
});
