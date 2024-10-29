import { Injectable } from '@nestjs/common';
import { BlogMetadata } from './blog-metadata.types';
import { GetBlogMetadataDto } from '../blogs/dtos/get-blog-metadata.dto';

export type UpdateBlogMetadata = Partial<
  Omit<BlogMetadata, 'updatedAtUtc' | 'PostId'> & { PostId: string }
>;

export interface ListBlogMetadataResponse {
  metadata: BlogMetadata[];
  nextPageCursor?: string;
}
@Injectable()
export abstract class BlogMetadataService {
  // CRUD methods for blog metadata
  async listBlogMetadata(
    _dto: GetBlogMetadataDto,
  ): Promise<ListBlogMetadataResponse> {
    throw new Error('Method not implemented.');
  }

  async createBlogMetadata(_blogMetadata: BlogMetadata): Promise<BlogMetadata> {
    throw new Error('Method not implemented.');
  }

  async updateBlogMetadata(_blogMetadata: UpdateBlogMetadata): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async deleteBlogMetadata(
    _id: string,
    _immediately: boolean = false,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteBlogMetadataIfExists(_id: string): Promise<void> {
    throw new Error('deleteBloMetadataIfExists not implemented.');
  }
  async checkBlogMetadataExists(_id: string): Promise<boolean> {
    throw new Error('checkBlogMetadataExists not implemented.');
  }
}
