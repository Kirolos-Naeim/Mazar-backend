import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: allow comma-separated origins from env, or default to both localhost and
  // the minikube frontend NodePort so browser requests are not rejected.
  const rawOrigins = process.env.CORS_ORIGIN;
  const origins = rawOrigins
    ? rawOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : [
      'http://localhost:3000',
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,   // any minikube/VM IP
    ];

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
