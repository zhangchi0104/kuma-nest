import { Module } from '@nestjs/common';
import { BlogContentService } from './blog-content.service';
import { S3BlogContentService } from './impls/blog-content.service.s3';

@Module({
  providers: [
    {
      provide: BlogContentService,
      useClass: S3BlogContentService,
    },
  ],
  exports: [BlogContentService],
})
export class BlogContentModule {}
