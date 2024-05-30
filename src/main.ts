import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { isRunningLocal } from './utils/utils.helpers';

async function bootstrap() {
  if (isRunningLocal) {
    console.log('============================');
    console.log('Running in local dev mode.');
    console.log('============================\n');
  }
  console.log('Starting server on http://localhost:3000');
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
