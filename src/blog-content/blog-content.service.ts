import { Injectable } from '@nestjs/common';
import { BlogContent, BlogId } from './blog-content.types';

@Injectable()
export class BlogContentService {
  async getBlog(_id: string): Promise<BlogContent> {
    throw new Error('Method not implemented.');
  }

  async deleteBlog(_id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async createBlog(_id: string, _content: BlogContent): Promise<string> {
    throw new Error('Method not implemented');
  }

  async updateBlog(_id: BlogId, _content: BlogContent): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteBlogIfExists(_id: BlogId): Promise<void> {
    throw new Error('deleteBlogIfExists not implemented.');
  }
}
