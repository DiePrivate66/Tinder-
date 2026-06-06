import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceClients } from '../contracts/service-clients';
import { AuthGatewayController } from './auth-gateway.controller';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';
import { GatewayPermissionsGuard } from './gateway-permissions.guard';
import { UsersGatewayController } from './users-gateway.controller';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule.register([
      {
        name: ServiceClients.auth,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST ?? '127.0.0.1',
          port: Number(process.env.AUTH_SERVICE_PORT ?? 4001),
        },
      },
      {
        name: ServiceClients.users,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_SERVICE_HOST ?? '127.0.0.1',
          port: Number(process.env.USERS_SERVICE_PORT ?? 4002),
        },
      },
    ]),
  ],
  controllers: [AuthGatewayController, UsersGatewayController],
  providers: [GatewayJwtAuthGuard, GatewayPermissionsGuard, CoreRpcService],
})
export class GatewayModule {}
