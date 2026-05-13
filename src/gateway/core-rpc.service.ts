import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class CoreRpcService {
  private readonly logger = new Logger(CoreRpcService.name);

  constructor(
    @Inject('CORE_SERVICE_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  async send<TResponse, TPayload>(pattern: string, payload: TPayload) {
    try {
      return await firstValueFrom(
        this.client.send<TResponse, TPayload>(pattern, payload).pipe(timeout(10_000)),
      );
    } catch (error) {
      this.logger.error(`RPC error for pattern "${pattern}"`, error as Error);
      throw this.toHttpException(error);
    }
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
