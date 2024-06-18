import { Module } from '@nestjs/common';
import { BlogMetadataService } from './blog-metadata.service';
import { AwsBlogMetadataService } from './impls/blog-metadata.service.aws';

@Module({
  providers: [
    {
      provide: BlogMetadataService,
      useClass: AwsBlogMetadataService,
    },
  ],
  exports: [BlogMetadataService],
})
export class BlogMetadataModule {}
