import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips fields the DTO doesn't declare
      forbidNonWhitelisted: true, // rejects them with a 400 instead
      transform: true, // "5" in the URL becomes the number 5
    }),
  );

  // the browser (Next.js on another port) is allowed to call this API
  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001',
  });

  await app.listen(3000);
}
bootstrap();