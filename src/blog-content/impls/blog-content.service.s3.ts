import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BlogContentService } from '../blog-content.service';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { isRunningLocal } from 'src/utils/utils.constants';
import env from 'src/env';
import { BlogContent, BlogId } from '../blog-content.types';

@Injectable()
export class S3BlogContentService extends BlogContentService {
  private s3Client: S3Client;
  constructor() {
    super();
    this.s3Client = isRunningLocal
      ? new S3Client({
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          },
          region: env.AWS_ACCOUNT_REGION,
        })
      : new S3Client({});
  }

  async getBlog(id: string): Promise<BlogContent> {
    console.log('Getting blog content from S3:', env.BLOG_CONTENT_BUCKET);
    const cmd = new GetObjectCommand({
      Bucket: env.BLOG_CONTENT_BUCKET,

      Key: id,
    });
    try {
      const resp = await this.s3Client.send(cmd);
      const content = await resp.Body?.transformToString();
      if (!content) {
        throw new NotFoundException(id);
      }
      return content;
    } catch (e) {
      if (e instanceof S3ServiceException) {
        if (e.name === 'NoSuchKey') {
          throw new NotFoundException(id);
        }
      }
      throw e;
    }
  }
  async createBlog(id: string, content: BlogContent): Promise<string> {
    console.log('Creating blog content in S3:', env.BLOG_CONTENT_BUCKET);
    const cmd = new PutObjectCommand({
      Bucket: env.BLOG_CONTENT_BUCKET,
      Key: id,
      Body: content,
    });

    try {
      await this.s3Client.send(cmd);
      return id;
    } catch (e) {
      console.error(e);
      throw new BadRequestException('id');
    }
  }

  async deleteBlog(id: string): Promise<void> {
    const cmd = new DeleteObjectCommand({
      Bucket: env.BLOG_CONTENT_BUCKET,
      Key: id,
    });
    try {
      await this.s3Client.send(cmd);
    } catch (e) {
      if (e instanceof S3ServiceException) {
        if (e.name === 'NoSuchKey') {
          throw new NotFoundException(id);
        }
      }
      console.error(e);
      throw new InternalServerErrorException({
        message: 'unexpected error while deleting blog content',
        error: e,
      });
    }
  }

  async deleteBlogIfExists(id: BlogId): Promise<void> {
    try {
      await this.deleteBlog(id);
    } catch (e) {
      if (e instanceof NotFoundException) {
        return;
      }
      throw e;
    }
  }
}
