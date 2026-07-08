import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { StartMatchDto } from '../match/dto/start-match.dto';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';

interface WithUserId<TDto = undefined> {
  userId: number;
  dto?: TDto;
}

@UseGuards(GatewayJwtAuthGuard)
@Controller('matches')
export class MatchesGatewayController {
  constructor(private readonly rpc: CoreRpcService) {}

  @Get()
  listMyMatches(@CurrentUser() user: AuthUser) {
    return this.rpc.send(RpcPatterns.match.listByUserId, user.userId);
  }

  @Post()
  createMatch(@CurrentUser() user: AuthUser, @Body() dto: StartMatchDto) {
    const payload: WithUserId<StartMatchDto> = {
      userId: user.userId,
      dto,
    };

    return this.rpc.send(RpcPatterns.match.create, payload);
  }
}
