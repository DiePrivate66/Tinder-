import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.CORE_SERVICE_HOST ?? '127.0.0.1',
        port: Number(process.env.CORE_SERVICE_PORT ?? 4001),
      },
    },
  );

  await app.listen();
}

bootstrap();
