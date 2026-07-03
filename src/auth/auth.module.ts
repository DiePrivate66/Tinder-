import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { createServiceClientRegistrations } from '../contracts/service-registry';
import { AuthPrismaService } from '../prisma/auth-prisma.service';
import { AuthMessageController } from './auth.message.controller';
import { AuthService } from './auth.service';
import { AuthorizationService } from './authorization.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersRpcService } from './users-rpc.service';

@Module({
  imports: [
    PassportModule,
    ClientsModule.register(createServiceClientRegistrations(['users'])),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is required.');
        }

        return {
          secret,
          signOptions: { expiresIn: '7d' },
        };
      },
    }),
  ],
  controllers: [AuthMessageController],
  providers: [
    AuthPrismaService,
    AuthService,
    AuthorizationService,
    JwtStrategy,
    UsersRpcService,
  ],
})
export class AuthModule {}
