import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { BlogMetadataModule } from 'src/blog-metadata/blog-metadata.module';

@Module({
  imports:[BlogMetadataModule],
  controllers:[BlogsController]
})
export class BlogsModule {}
