import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { MatchStatus } from '../../generated/prisma/match';
import { MatchPrismaService } from '../prisma/match-prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';

export interface MatchView {
  id: number;
  userOneId: number;
  userTwoId: number;
  matchedUserId?: number;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MatchService {
  constructor(private readonly prisma: MatchPrismaService) {}

  health() {
    return {
      service: 'match',
      status: 'ok',
    };
  }

  async createMatch(dto: CreateMatchDto): Promise<MatchView> {
    const [userOneId, userTwoId] = this.normalizePair(dto.userAId, dto.userBId);

    const existingMatch = await this.prisma.match.findUnique({
      where: {
        userOneId_userTwoId: {
          userOneId,
          userTwoId,
        },
      },
    });

    if (existingMatch) {
      return this.toMatchView(existingMatch);
    }

    const match = await this.prisma.match.create({
      data: {
        userOneId,
        userTwoId,
      },
    });

    return this.toMatchView(match);
  }

  async listMatchesByUserId(userId: number): Promise<MatchView[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return matches.map((match) => this.toMatchView(match, userId));
  }

  private normalizePair(userAId: number, userBId: number): [number, number] {
    if (userAId === userBId) {
      throw new UnprocessableEntityException(
        'A match requires two different users.',
      );
    }

    return userAId < userBId ? [userAId, userBId] : [userBId, userAId];
  }

  private toMatchView(
    match: {
      id: number;
      userOneId: number;
      userTwoId: number;
      status: MatchStatus;
      createdAt: Date;
      updatedAt: Date;
    },
    currentUserId?: number,
  ): MatchView {
    return {
      id: match.id,
      userOneId: match.userOneId,
      userTwoId: match.userTwoId,
      matchedUserId:
        currentUserId === undefined
          ? undefined
          : currentUserId === match.userOneId
            ? match.userTwoId
            : match.userOneId,
      status: match.status,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };
  }
}
