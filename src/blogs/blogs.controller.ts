import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  Param,
  Put,
  Query,
  UseFilters,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GetBlogMetadataDto } from './dtos/get-blog-metadata.dto';
import { BlogMetadataService } from 'src/blog-metadata/blog-metadata.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserRole } from 'src/auth/decorators/requires-admin.decorator';
import { UserRoles } from 'src/auth/auth.type';
import { BlogContentService } from 'src/blog-content/blog-content.service';
import { CreateBlogDto } from './dtos/create-blog.dto';

import { S3ServiceExceptionFilter } from 'src/filters/s3-service-exception.filter';

@Controller('blogs')
@UseFilters(S3ServiceExceptionFilter)
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
    console.log(query);
    const { pageSize, ...rest } = query;
    const actualPageSize = (pageSize ?? 5) + 1;
    const awsResult = await this.metadataService.listBlogMetadata({
      ...rest,
      pageSize: actualPageSize,
    });
    if (awsResult.metadata.length === actualPageSize) {
      awsResult.metadata.pop();
      const lastItem = awsResult.metadata[awsResult.metadata.length - 1];
      const cursor = {
        BlogId: lastItem.BlogId,
        CreatedAtUtc: lastItem.CreatedAtUtc,
        LanguageCode: lastItem.LanguageCode,
      };
      return {
        metadata: awsResult.metadata,
        cursor: encodeURIComponent(JSON.stringify(cursor)),
      };
    }
    return {
      ...awsResult,
      cursor: undefined,
    };
  }

  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.contentService.getBlog(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UserRole(UserRoles.ADMIN)
  async createBlog(@Param('id') id: string, @Body() body: CreateBlogDto) {
    if (await this.metadataService.checkBlogMetadataExists(id)) {
      throw new BadRequestException({
        message: 'Blog already exists',
        data: { id },
      });
    }
    try {
      const { content, metadata } = body;
      const { title, description, tags, createdAt, languageCode } = metadata;
      await Promise.all([
        this.metadataService.createBlogMetadata({
          BlogId: id,
          Title: title,
          Description: description,
          Tags: tags,
          CreatedAtUtc: createdAt,
          LanguageCode: languageCode,
        }),
        this.contentService.createBlog(id, content),
      ]);
      return id;
    } catch (e) {
      console.error(e);
      if (e instanceof HttpException) {
        throw e;
      }
      await this.metadataService.deleteBlogMetadata(id).catch(() => {});
      await this.contentService.deleteBlog(id).catch(() => {});
      throw new InternalServerErrorException({
        message: 'Failed to create blog',
        data: { id },
        error: e,
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UserRole(UserRoles.ADMIN)
  async deleteBlog(@Param('id') id: string) {
    await this.metadataService.deleteBlogMetadata(id);
  }

  //@Delete(':id')
  //@UseGuards(AuthGuard)
  //@UserRole(UserRoles.ADMIN)
  //async updateBlog(@Param(':id') id: string, dto: DeleteBlogDto) {}
}
