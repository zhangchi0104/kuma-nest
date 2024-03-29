import { Injectable } from '@nestjs/common';

import { AwsService } from './aws/aws.service';
@Injectable()
export class AppService {
  constructor(private awsService: AwsService) {}
  getHello() {
    return {
      message: 'Hello World!',
      date: new Date().toISOString(),
    };
  }
  // test all permission needed
  async test() {
    return await this.awsService.test();
  }
}
