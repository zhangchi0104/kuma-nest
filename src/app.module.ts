import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AwsService } from './aws/aws.service';
import { AwsModule } from './aws/aws.module';
import { AuthModule } from './auth/auth.module';
import { ProtectedModule } from './protected/protected.module';
@Module({
  imports: [AwsModule, AuthModule, ProtectedModule],
  controllers: [AppController],
  providers: [AppService, AwsService],
})
export class AppModule {}
