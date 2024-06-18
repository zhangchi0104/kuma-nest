import {
  Body,
  Controller,
  Get,
  Injectable,
  Param,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GetBlogMetadataDto } from './dtos/get-blog-metadata.dto';
import { CreateMetadataDto } from './dtos/create-metadata.dto';
import { BlogMetadataService } from 'src/blog-metadata/blog-metadata.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRole } from 'src/auth/decorators/requires-admin.decorator';
import { UserRoles } from 'src/auth/auth.type';

@Controller('blogs')
@Injectable()
export class BlogsController {
  constructor(private readonly metadataService: BlogMetadataService) {}
  @Get() // GET /blogs
  async getBlogs(
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    query: GetBlogMetadataDto,
  ) {
    console.log(query);
    const { pageSize, cursor } = query;
    return await this.metadataService.listBlogMetadata(pageSize ?? 10, cursor);
  }

  @Put(':id/metadata') //   PUT /blogs/:id/metadata
  @UseGuards(AuthGuard)
  @UserRole(UserRoles.ADMIN)
  async createBlogMetadata(
    @Param('id') id: string,
    @Body() blog: CreateMetadataDto,
  ) {
    const { title, description, tags, createdAt } = blog;
    return await this.metadataService.createBlogMetadata({
      id,
      title,
      description,
      tags,
      publishedAtUtc: createdAt,
    });
  }

  //@Post(':id/metadata')
  //@UseGuards(AuthGuard)
  //@UserRole(UserRoles.ADMIN)
  //async updateBlogMetadata(
  //  @Param('id') id: string,
  //  @Body() blog: UpdateMetadataDto,
  //) {}
}
