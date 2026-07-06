import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { StartMatchDto } from '../src/match/dto/start-match.dto';
import { RpcPatterns } from '../src/contracts/rpc-patterns';
import { CoreRpcService } from '../src/gateway/core-rpc.service';
import { GatewayModule } from '../src/gateway/gateway.module';

describe('MatchesGatewayController (e2e)', () => {
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

  it('GET /matches forwards the authenticated user id to match-ms', async () => {
    rpc.send.mockResolvedValue([
      {
        id: 1,
        userOneId: 2,
        userTwoId: 9,
        matchedUserId: 9,
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/matches')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .expect(200);

    expect(rpc.send).toHaveBeenCalledWith(RpcPatterns.match.listByUserId, 2);
    expect(response.body).toEqual([
      {
        id: 1,
        userOneId: 2,
        userTwoId: 9,
        matchedUserId: 9,
      },
    ]);
  });

  it('POST /matches validates the body before hitting RPC', async () => {
    await request(app.getHttpServer())
      .post('/matches')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .send({})
      .expect(400);

    expect(rpc.send).not.toHaveBeenCalled();
  });

  it('POST /matches sends the authenticated user id and counterpart user id', async () => {
    rpc.send.mockResolvedValue({
      id: 5,
      userOneId: 2,
      userTwoId: 8,
      matchedUserId: 8,
    });

    const dto: StartMatchDto = { counterpartUserId: 8 };

    const response = await request(app.getHttpServer())
      .post('/matches')
      .set('Authorization', `Bearer ${createToken(2)}`)
      .send(dto)
      .expect(201);

    expect(rpc.send).toHaveBeenCalledWith(RpcPatterns.match.create, {
      userId: 2,
      dto,
    });
    expect(response.body).toEqual({
      id: 5,
      userOneId: 2,
      userTwoId: 8,
      matchedUserId: 8,
    });
  });
});
