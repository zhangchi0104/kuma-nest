import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AwsService } from './aws/aws.service';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [AppController],
  providers: [AppService, AwsService],
})
export class AppModule {}
