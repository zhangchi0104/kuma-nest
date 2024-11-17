import { Prisma } from '@prisma/client';
import prisma from './db-client';

const makeFakeData = async () => {
  prisma.post.create({
    data: {
      title: 'test',
      languages: {},
      tags: {},
    },
  });
};
