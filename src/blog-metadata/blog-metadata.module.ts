import { Module } from '@nestjs/common';
import { BlogMetadataService } from './blog-metadata.service';
import { PrismaBlogMetadata } from './impls/blog-metadata.service.prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    {
      provide: BlogMetadataService,
      useClass: PrismaBlogMetadata,
    },
    PrismaService,
  ],
  exports: [BlogMetadataService],
})
export class BlogMetadataModule {}
