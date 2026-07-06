import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { RpcPatterns } from '../src/contracts/rpc-patterns';
import { CoreRpcService } from '../src/gateway/core-rpc.service';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('ChatsGatewayController (e2e)', () => {
  let app: INestApplication<App>;

  const rpc = {
    send: jest.fn(),
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    })
      .overrideProvider(CoreRpcService)
      .useValue(rpc)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  function createToken(userId = 2) {
    const jwtService = new JwtService({ secret: process.env.JWT_SECRET });

    return jwtService.sign({
      sub: userId,
      email: `user${userId}@example.com`,
      roles: ['USER'],
      permissions: [],
    });
  }

  it('GET /chats forwards the authenticated user id to chat-ms', async () => {
    rpc.send.mockResolvedValue([
      {
        id: 1,
        participantOneId: 2,
        participantTwoId: 8,
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/chats')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .expect(200);

    expect(rpc.send).toHaveBeenCalledWith(
      RpcPatterns.chat.listConversationsByUserId,
      2,
    );
    expect(response.body).toEqual([
      {
        id: 1,
        participantOneId: 2,
        participantTwoId: 8,
      },
    ]);
  });

  it('POST /chats validates the body before hitting RPC', async () => {
    await request(app.getHttpServer())
      .post('/chats')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .send({})
      .expect(400);

    expect(rpc.send).not.toHaveBeenCalled();
  });

  it('POST /chats sends the authenticated user id and counterpart user id', async () => {
    rpc.send.mockResolvedValue({
      id: 9,
      participantOneId: 2,
      participantTwoId: 8,
    });

    const response = await request(app.getHttpServer())
      .post('/chats')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .send({ counterpartUserId: 8 })
      .expect(201);

    expect(rpc.send).toHaveBeenCalledWith(RpcPatterns.chat.createConversation, {
      userId: 2,
      dto: { counterpartUserId: 8 },
    });
    expect(response.body).toEqual({
      id: 9,
      participantOneId: 2,
      participantTwoId: 8,
    });
  });

  it('POST /chats/:conversationId/messages validates the body before hitting RPC', async () => {
    await request(app.getHttpServer())
      .post('/chats/5/messages')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .send({})
      .expect(400);

    expect(rpc.send).not.toHaveBeenCalled();
  });

  it('POST /chats/:conversationId/messages forwards the authenticated user id', async () => {
    rpc.send.mockResolvedValue({
      id: 30,
      conversationId: 5,
      senderUserId: 2,
      body: 'Hola gateway',
    });

    const response = await request(app.getHttpServer())
      .post('/chats/5/messages')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .send({ body: 'Hola gateway' })
      .expect(201);

    expect(rpc.send).toHaveBeenCalledWith(RpcPatterns.chat.sendMessage, {
      userId: 2,
      dto: {
        conversationId: 5,
        body: 'Hola gateway',
      },
    });
    expect(response.body).toEqual({
      id: 30,
      conversationId: 5,
      senderUserId: 2,
      body: 'Hola gateway',
    });
  });

  it('GET /chats/:conversationId/messages forwards user and conversation ids', async () => {
    rpc.send.mockResolvedValue([
      {
        id: 1,
        conversationId: 5,
        senderUserId: 2,
        body: 'Hola',
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/chats/5/messages')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .expect(200);

    expect(rpc.send).toHaveBeenCalledWith(
      RpcPatterns.chat.listMessagesByConversation,
      {
        userId: 2,
        conversationId: 5,
      },
    );
    expect(response.body).toEqual([
      {
        id: 1,
        conversationId: 5,
        senderUserId: 2,
        body: 'Hola',
      },
    ]);
  });
});
