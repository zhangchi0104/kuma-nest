import { Controller, Get, Injectable, Query, ValidationPipe } from '@nestjs/common';
import { GetBlogMetadataDto } from './dtos/get-blog-metadata.dto';
import { BlogMetadataService } from 'src/blog-metadata/blog-metadata.service';



@Controller('blogs')
@Injectable()
export class BlogsController {
  constructor( private readonly metadataService: BlogMetadataService) {
  }
  @Get() // GET /blogs
  async getBlogs(
    @Query(new ValidationPipe({
      transform: true, 
    })) query: GetBlogMetadataDto,
  ) {
    console.log(query);
    const { pageSize, cursor } = query;
    return await this.metadataService.listBlogMetadata(pageSize ?? 10, cursor)
  }
}
