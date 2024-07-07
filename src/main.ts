import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { isRunningLocal } from './utils/utils.constants';
import { ValidationPipe } from '@nestjs/common';
const APP_PORT = process.env.PORT || 8000;
async function bootstrap() {
  if (isRunningLocal) {
    console.log('============================');
    console.log('Running in local dev mode.');
    console.log('============================\n');
  }
  console.log('Starting server on http://localhost:' + APP_PORT.toString());
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(APP_PORT);
}
bootstrap();
