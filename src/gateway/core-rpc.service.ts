import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  getServiceClientToken,
  getServiceKeyForRpcPattern,
} from '../contracts/service-registry';

@Injectable()
export class CoreRpcService {
  private readonly logger = new Logger(CoreRpcService.name);
  private readonly clients = new Map<string, ClientProxy>();

  constructor(private readonly moduleRef: ModuleRef) {}

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
    const serviceKey = getServiceKeyForRpcPattern(pattern);
    const clientToken = getServiceClientToken(serviceKey);
    const cachedClient = this.clients.get(clientToken);

    if (cachedClient) {
      return cachedClient;
    }

    const client = this.moduleRef.get<ClientProxy>(clientToken, {
      strict: false,
    });

    if (!client) {
      throw new HttpException(
        `RPC client "${clientToken}" is not available`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.clients.set(clientToken, client);
    return client;
  }

  private toHttpException(error: unknown): HttpException {
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
      return new HttpException(
        err.message ?? 'Service error',
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
      return new HttpException(
        err.message ?? 'Service error',
        err.statusCode,
      );
    }

    return new HttpException(
      'Service unavailable',
      HttpStatus.BAD_GATEWAY,
    );
  }
}
