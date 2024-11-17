import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    if (process.env.LAZY_DB_CONNECT === 'true') {
      console.log('Skipping DB connection');
      return;
    }
    console.log('Prisma Url: ' + process.env.DATABASE_TRANSACTION_URL);
    await this.$connect();
  }
}
