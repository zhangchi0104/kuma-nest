import { Injectable } from '@nestjs/common';
import { BlogMetadata } from './blog-metadata.types';

@Injectable()
export abstract class BlogMetadataService {
  // CRUD methods for blog metadata
  async listBlogMetadata(
    _pageSize: number,
    _cursor?: string,
  ): Promise<BlogMetadata[]> {
    throw new Error('Method not implemented.');
  }

  async createBlogMetadata(_blogMetadata: BlogMetadata): Promise<BlogMetadata> {
    throw new Error('Method not implemented.');
  }

  async updateBlogMetadata(_blogMetadata: BlogMetadata): Promise<BlogMetadata> {
    throw new Error('Method not implemented.');
  }
  async deleteBlogMetadata(_id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
