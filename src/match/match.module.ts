import { Module } from '@nestjs/common';
import { MatchPrismaService } from '../prisma/match-prisma.service';
import { MatchMessageController } from './match.message.controller';
import { MatchService } from './match.service';

@Module({
  controllers: [MatchMessageController],
  providers: [MatchPrismaService, MatchService],
  exports: [MatchService],
})
export class MatchModule {}
