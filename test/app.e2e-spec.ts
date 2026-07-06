import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GatewayModule } from './../src/gateway/gateway.module';

describe('Gateway (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET) without token returns 401 before hitting RPC', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(401);
  });

  it('/chats (GET) without token returns 401 before hitting RPC', () => {
    return request(app.getHttpServer())
      .get('/chats')
      .expect(401);
  });

  it('/chats/:conversationId/messages (GET) without token returns 401 before hitting RPC', () => {
    return request(app.getHttpServer())
      .get('/chats/1/messages')
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
