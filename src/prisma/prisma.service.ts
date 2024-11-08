import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    console.log('Prisma Url: ' + process.env.DATABASE_TRANSACTION_URL);
    await this.$connect();
  }
}
