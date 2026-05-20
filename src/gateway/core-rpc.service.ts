import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { RpcPatterns } from '../contracts/rpc-patterns';
import { ServiceClients } from '../contracts/service-clients';

@Injectable()
export class CoreRpcService {
  private readonly logger = new Logger(CoreRpcService.name);

  constructor(
    @Inject(ServiceClients.auth)
    private readonly authClient: ClientProxy,
    @Inject(ServiceClients.users)
    private readonly usersClient: ClientProxy,
  ) {}

  async send<TResponse, TPayload>(pattern: string, payload: TPayload) {
    try {
      const client = this.getClient(pattern);
      return await firstValueFrom(
        client.send<TResponse, TPayload>(pattern, payload).pipe(timeout(10_000)),
      );
    } catch (error) {
      this.logger.error(`RPC error for pattern "${pattern}"`, error as Error);
      throw this.toHttpException(error);
    }
  }

  private getClient(pattern: string): ClientProxy {
    if (pattern.startsWith(RpcPatterns.auth.register.split('.')[0])) {
      return this.authClient;
    }

    if (pattern.startsWith(RpcPatterns.users.findAll.split('.')[0])) {
      return this.usersClient;
    }

    throw new HttpException(
      `No RPC client configured for pattern "${pattern}"`,
      HttpStatus.BAD_GATEWAY,
    );
  }

  private toHttpException(error: unknown) {
    if (error instanceof HttpException) {
      return error;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status: unknown }).status === 'number'
    ) {
      const err = error as { status: number; message?: string };
      throw new HttpException(
        err.message ?? 'Core service error',
        err.status,
      );
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof (error as { statusCode: unknown }).statusCode === 'number'
    ) {
      const err = error as { statusCode: number; message?: string };
      throw new HttpException(
        err.message ?? 'Core service error',
        err.statusCode,
      );
    }

    throw new HttpException(
      'Core service unavailable',
      HttpStatus.BAD_GATEWAY,
    );
  }
}
