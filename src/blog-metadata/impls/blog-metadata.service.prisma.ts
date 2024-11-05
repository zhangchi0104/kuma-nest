import { Injectable } from '@nestjs/common';
import {
  BlogMetadataService,
  ListBlogMetadataResponse,
} from '../blog-metadata.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetBlogMetadataDto } from 'src/blogs/dtos/get-blog-metadata.dto';
@Injectable()
export class PrismaBlogMetadata extends BlogMetadataService {
  constructor(private prisma: PrismaService) {
    super();
  }

  async listBlogMetadata(
    dto: GetBlogMetadataDto,
  ): Promise<ListBlogMetadataResponse> {
    const cursorAsNumber = dto.cursor;
    const pageSize = dto.pageSize ?? 5;
    const metadata = await this.prisma.post.findMany({
      skip: cursorAsNumber,
      take: pageSize + 1,
      orderBy: { createdAt: 'desc' },
      where: {
        languages: {
          some: {
            languageCode: dto.languageCode,
          },
        },
      },
    });
    let nextPageCursor = undefined;
    if (metadata.length === pageSize + 1) {
      metadata.pop();
      nextPageCursor = (cursorAsNumber || 0) + pageSize;
    }
    return {
      metadata,
      nextPageCursor,
    };
  }
}
