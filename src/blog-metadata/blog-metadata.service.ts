import { Injectable } from '@nestjs/common';
import { BlogMetadata } from './blog-metadata.types';

@Injectable()
export abstract class BlogMetadataService {
  // CRUD methods for blog metadata
  async listBlogMetadata(pageSize: number, cursor?: string): Promise<BlogMetadata[]> {
    throw new Error('Method not implemented.');
  }

  async createBlogMetadata(blogMetadata: BlogMetadata): Promise<BlogMetadata> {
    throw new Error('Method not implemented.');
  }

  async updateBlogMetadata(blogMetadata: BlogMetadata): Promise<BlogMetadata> {
    throw new Error('Method not implemented.');
  }
  async deleteBlogMetadata(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
