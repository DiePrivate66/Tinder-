import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type { AuthUserRecord, PublicUser } from '../users/domain/user.types';

export const USERS_SERVICE_CLIENT = 'USERS_SERVICE_CLIENT';

@Injectable()
export class UsersRpcService {
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly usersClient: ClientProxy,
  ) {}

  findByEmailForAuth(email: string): Promise<AuthUserRecord | null> {
    return this.send<AuthUserRecord | null, string>(
      RpcPatterns.users.findByEmailForAuth,
      email,
    );
  }

  create(dto: CreateUserDto): Promise<PublicUser> {
    return this.send<PublicUser, CreateUserDto>(RpcPatterns.users.create, dto);
  }

  findById(id: number): Promise<PublicUser | null> {
    return this.send<PublicUser | null, number>(RpcPatterns.users.getById, id);
  }

  private send<TResponse, TPayload>(
    pattern: string,
    payload: TPayload,
  ): Promise<TResponse> {
    return firstValueFrom(
      this.usersClient
        .send<TResponse, TPayload>(pattern, payload)
        .pipe(timeout(10_000)),
    );
  }
}
