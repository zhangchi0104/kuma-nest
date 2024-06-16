import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlogMetadataService } from '../blog-metadata.service';
import { BlogMetadata } from '../blog-metadata.types';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { isRunningLocal } from 'src/utils/utils.constants';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import env from 'src/env';

@Injectable()
export class AwsBlogMetadataService extends BlogMetadataService {
  docClient: DynamoDBDocumentClient;
  constructor() {
    super();
    const dynamoDb = isRunningLocal
      ? new DynamoDBClient({
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          },
          region: env.AWS_ACCOUNT_REGION,
        })
      : new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoDb);
  }

  async listBlogMetadata(pageSize: number, cursor?: string) {
    const cmd = await this.prepareQueryCmd(pageSize, cursor);
    const result = await this.docClient.send(cmd);
    if (!result.Items) {
      return [];
    }
    return result as any as BlogMetadata[];
  }

  async createBlogMetadata(blogMetadata: BlogMetadata): Promise<BlogMetadata> {
    throw new InternalServerErrorException('Method not implemented.');
  }

  async updateBlogMetadata(blogMetadata: BlogMetadata): Promise<BlogMetadata> {
    throw new InternalServerErrorException('Method not implemented.');
  }
  async deleteBlogMetadata(id: string): Promise<void> {
    throw new InternalServerErrorException('Method not implemented.');
  }

  private async prepareQueryCmd(pageSize: number, cursor?: string) {
    const params = new ScanCommand({
      TableName: AwsBlogMetadataService.blogMetadataTableName,
      Limit: pageSize,
      ExclusiveStartKey: cursor
        ? (JSON.parse(cursor) as ScanCommandInput['ExclusiveStartKey'])
        : undefined,
    });

    return params;
  }

  private static get blogMetadataTableName() {
    return `${env.BLOG_METADATA_TABLE}-${env.SLS_STAGE}`;
  }
}
