import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGatewayController } from './auth-gateway.controller';
import { CoreRpcService } from './core-rpc.service';
import { GatewayJwtAuthGuard } from './gateway-jwt-auth.guard';
import { UsersGatewayController } from './users-gateway.controller';

const CORE_SERVICE_CLIENT = 'CORE_SERVICE_CLIENT';

@Module({
  imports: [
    JwtModule.register({}),
    ClientsModule.register([
      {
        name: CORE_SERVICE_CLIENT,
        transport: Transport.TCP,
        options: {
          host: process.env.CORE_SERVICE_HOST ?? '127.0.0.1',
          port: Number(process.env.CORE_SERVICE_PORT ?? 4001),
        },
      },
    ]),
  ],
  controllers: [AuthGatewayController, UsersGatewayController],
  providers: [GatewayJwtAuthGuard, CoreRpcService],
})
export class GatewayModule {}
