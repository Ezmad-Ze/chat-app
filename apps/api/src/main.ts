// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(3000);
  Logger.log('NestJS app running on http://localhost:3000', 'Bootstrap');

  // Graceful shutdown
  process.on('SIGTERM', () => app.close());
  process.on('SIGINT', () => app.close());
}

bootstrap();