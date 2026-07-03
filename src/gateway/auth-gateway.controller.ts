import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';

@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly rpc: CoreRpcService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.rpc.send(RpcPatterns.auth.register, dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.rpc.send(RpcPatterns.auth.login, dto);
  }

  @UseGuards(GatewayJwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.rpc.send(RpcPatterns.auth.me, user);
  }
}
