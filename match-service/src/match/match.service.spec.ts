import { UnprocessableEntityException } from '@nestjs/common';
import { MatchStatus } from '../../generated/prisma';
import { MatchPrismaService } from '../prisma/match-prisma.service';
import { MatchService } from './match.service';

describe('MatchService', () => {
  const matchDelegate = {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  };

  let service: MatchService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new MatchService({
      match: matchDelegate,
    } as unknown as MatchPrismaService);
  });

  it('rejects matches with the same user twice', async () => {
    await expect(
      service.createMatch({ userAId: 10, userBId: 10 }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('normalizes the pair before creating the match', async () => {
    matchDelegate.findUnique.mockResolvedValue(null);
    matchDelegate.create.mockResolvedValue({
      id: 1,
      userOneId: 2,
      userTwoId: 9,
      status: MatchStatus.ACTIVE,
      createdAt: new Date('2026-07-06T00:00:00.000Z'),
      updatedAt: new Date('2026-07-06T00:00:00.000Z'),
    });

    const result = await service.createMatch({ userAId: 9, userBId: 2 });

    expect(matchDelegate.findUnique).toHaveBeenCalledWith({
      where: {
        userOneId_userTwoId: {
          userOneId: 2,
          userTwoId: 9,
        },
      },
    });
    expect(result.userOneId).toBe(2);
    expect(result.userTwoId).toBe(9);
  });

  it('computes the matched user when listing matches for a user', async () => {
    matchDelegate.findMany.mockResolvedValue([
      {
        id: 1,
        userOneId: 3,
        userTwoId: 8,
        status: MatchStatus.ACTIVE,
        createdAt: new Date('2026-07-06T00:00:00.000Z'),
        updatedAt: new Date('2026-07-06T00:00:00.000Z'),
      },
    ]);

    const result = await service.listMatchesByUserId(3);

    expect(result[0]).toMatchObject({
      id: 1,
      matchedUserId: 8,
      status: MatchStatus.ACTIVE,
    });
  });
});
