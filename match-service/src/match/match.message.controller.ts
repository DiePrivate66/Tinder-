import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchService } from './match.service';

interface WithUserId<TDto = undefined> {
  userId: number;
  dto?: TDto;
}

@Controller()
export class MatchMessageController {
  constructor(private readonly matchService: MatchService) {}

  @MessagePattern(RpcPatterns.match.health)
  health() {
    return this.matchService.health();
  }

  @MessagePattern(RpcPatterns.match.create)
  create(@Payload() payload: WithUserId<{ counterpartUserId: number }>) {
    const counterpartUserId = payload.dto?.counterpartUserId;
    if (counterpartUserId === undefined) {
      throw new Error('counterpartUserId is required');
    }

    const dto: CreateMatchDto = {
      userAId: payload.userId,
      userBId: counterpartUserId,
    };

    return this.matchService.createMatch(dto);
  }

  @MessagePattern(RpcPatterns.match.listByUserId)
  listByUserId(@Payload() userId: number) {
    return this.matchService.listMatchesByUserId(userId);
  }
}
