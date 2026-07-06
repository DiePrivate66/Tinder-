import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import {
  createServiceClientRegistrations,
  listServiceKeys,
} from '../contracts/service-registry';
import { AuthGatewayController } from './auth-gateway.controller';
import { ChatsGatewayController } from './chats-gateway.controller';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';
import { GatewayPermissionsGuard } from './gateway-permissions.guard';
import { UsersGatewayController } from './users-gateway.controller';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule.register(createServiceClientRegistrations(listServiceKeys())),
  ],
  controllers: [
    AuthGatewayController,
    UsersGatewayController,
    ChatsGatewayController,
  ],
  providers: [CoreRpcService, GatewayJwtAuthGuard, GatewayPermissionsGuard],
})
export class GatewayModule {}
