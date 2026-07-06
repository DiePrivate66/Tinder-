import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchService } from './match.service';

@Controller()
export class MatchMessageController {
  constructor(private readonly matchService: MatchService) {}

  @MessagePattern(RpcPatterns.match.health)
  health() {
    return this.matchService.health();
  }

  @MessagePattern(RpcPatterns.match.create)
  create(@Payload() dto: CreateMatchDto) {
    return this.matchService.createMatch(dto);
  }

  @MessagePattern(RpcPatterns.match.listByUserId)
  listByUserId(@Payload() userId: number) {
    return this.matchService.listMatchesByUserId(userId);
  }
}
