import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = Array.from(
    new Set(
      (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://127.0.0.1:3000')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  );
  app.enableCors({ origin: corsOrigins, credentials: true });
  const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3001);
  const host = process.env.API_HOST ?? '127.0.0.1';
  await app.listen(port, host);
  console.log(`API listening on http://${host}:${port}`);
}
bootstrap();
