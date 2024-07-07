import { Injectable } from '@nestjs/common';
import {
  BlogMetadataService,
  UpdateBlogMetadata,
} from '../blog-metadata.service';
import { BlogMetadata } from '../blog-metadata.types';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  ScanCommandInput,
  UpdateCommand,
  QueryCommand,
  UpdateCommandInput,
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
    const putCmd = new PutCommand({
      TableName: AwsBlogMetadataService.blogMetadataTableName,
      Item: blogMetadata,
    });
    await this.docClient.send(putCmd);
    return blogMetadata;
  }

  async updateBlogMetadata(blogMetadata: UpdateBlogMetadata): Promise<void> {
    const updateCmd = this.prepareUpdateCommand(blogMetadata);
    await this.docClient.send(updateCmd);
  }

  async deleteBlogMetadata(
    id: string,
    immediately: boolean = false,
  ): Promise<void> {
    if (!immediately) {
      await this.updateBlogMetadata({ PostId: id, isDeleted: true });
      return;
    }
    const removeCmd = new DeleteCommand({
      Key: { id },
      TableName: AwsBlogMetadataService.blogMetadataTableName,
    });
    await this.docClient.send(removeCmd);
  }

  async deleteMetadataIfExists(id: string): Promise<void> {
    if (await this.checkBlogMetadataExists(id)) {
      await this.deleteBlogMetadata(id);
    }
  }

  async checkBlogMetadataExists(id: string): Promise<boolean> {
    const queryCmd = new QueryCommand({
      KeyConditionExpression: '#PK = :id',
      TableName: AwsBlogMetadataService.blogMetadataTableName,
      ExpressionAttributeValues: {
        ':id': id,
      },
      ExpressionAttributeNames: {
        '#PK': 'PostId',
      },
    });
    const result = await this.docClient.send(queryCmd);
    return result.Count ? result.Count > 0 : false;
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
    return `${env.BLOG_METADATA_TABLE}`;
  }
  private prepareUpdateCommand(blogMetadata: UpdateBlogMetadata) {
    let expr = 'Set updatedAtUtc = :updatedAtUtc';
    const values: UpdateCommandInput['ExpressionAttributeValues'] = {
      ':updatedAtUtc': new Date().toISOString(),
    };
    for (const [key, val] of Object.entries(blogMetadata)) {
      if (key === 'updatedAtUtc' || key === 'PostId' || val === undefined) {
        continue;
      }
      expr += `, ${key}=:${key}`;
      values[`:${key}`] = val;
    }
    if (blogMetadata.description) {
      expr += ', description=:description';
      values[':description'] = blogMetadata.description;
    }
    return new UpdateCommand({
      Key: { PostId: blogMetadata.PostId },
      TableName: AwsBlogMetadataService.blogMetadataTableName,
      UpdateExpression: expr,
      ExpressionAttributeValues: values,
    });
  }
}
