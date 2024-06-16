import { Injectable } from '@nestjs/common';


@Injectable()
export class AppService {

  getHello() {
    return {
      message: 'Hello World!',
      date: new Date().toISOString(),
    };
  }

}
