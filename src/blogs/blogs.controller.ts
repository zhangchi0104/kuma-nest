import {
  Controller,
  Get,
  Injectable,
  Logger,
  Query,
  UseFilters,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { GetBlogMetadataDto } from './dtos/get-blog-metadata.dto';
import { BlogMetadataService } from 'src/blog-metadata/blog-metadata.service';
import { BlogContentService } from 'src/blog-content/blog-content.service';

import { S3ServiceExceptionFilter } from 'src/filters/s3-service-exception.filter';
import { TransformInterceptor } from 'src/utils/wrap-with-data.interceptor';

@Controller('blogs')
@UseFilters(S3ServiceExceptionFilter)
@UseInterceptors(TransformInterceptor)
@Injectable()
export class BlogsController {
  private logger: Logger;
  constructor(
    private readonly metadataService: BlogMetadataService,
    private readonly contentService: BlogContentService,
  ) {
    this.logger = new Logger(BlogsController.name);
  }
  @Get() // GET /blogs
  async getBlogs(
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    query: GetBlogMetadataDto,
  ) {
    return await this.metadataService.listBlogMetadata(query);
  }
}
