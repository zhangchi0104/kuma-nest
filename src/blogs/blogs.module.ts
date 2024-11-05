import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogMetadataModule } from 'src/blog-metadata/blog-metadata.module';
import { BlogContentModule } from 'src/blog-content/blog-content.module';

@Module({
  imports: [BlogMetadataModule, BlogContentModule],
  controllers: [BlogsController],
})
export class BlogsModule {}
