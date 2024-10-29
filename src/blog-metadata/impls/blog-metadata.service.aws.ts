import { Injectable } from '@nestjs/common';
import {
  BlogMetadataService,
  UpdateBlogMetadata,
} from '../blog-metadata.service';
import { BlogMetadata } from '../blog-metadata.types';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  UpdateCommandInput,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { isRunningLocal } from 'src/utils/utils.constants';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import env from 'src/env';
import { GetBlogMetadataDto } from 'src/blogs/dtos/get-blog-metadata.dto';
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

  async listBlogMetadata(dto: GetBlogMetadataDto) {
    const cmd = await this.prepareQueryCmd(dto);
    const result = await this.docClient.send(cmd);
    if (!result.Items || result.Items.length === 0) {
      return {
        metadata: [],
        nextPageCursor: undefined,
      };
    }
    return {
      metadata: result.Items as BlogMetadata[],
      nextPageCursor: result.LastEvaluatedKey,
    };
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

  async deleteBlogMetadata(_id: string): Promise<void> {
    const queryCmd = new QueryCommand({
      KeyConditionExpression: '#PK = :id',
      TableName: AwsBlogMetadataService.blogMetadataTableName,
    });
    const queryRes = await this.docClient.send(queryCmd);
    const metadatas = queryRes.Items as any as BlogMetadata[];
    // BatchWrite only supports 25 items at a time
    // probably not going to have 100 langauges
    // one transaction should be enough
    const transactionBody: TransactWriteCommandInput['TransactItems'] =
      metadatas.map((m) => {
        const { BlogId, LanguageCode } = m;
        return {
          Update: {
            TableName: AwsBlogMetadataService.blogMetadataTableName,
            Key: { BlogId, LanguageCode },
            UpdateExpression:
              'set #isDeleted = :isDeleted, #deletedAtUtc = :deletedAtUtc',
            ExpressionAttributeValues: {
              ':isDeleted': true,
              ':deletedAtUtc': new Date().toISOString(),
            },
            ExpressionAttributeNames: {
              '#isDeleted': 'isDeleted',
              '#deletedAtUtc': 'deletedAtUtc',
            },
          },
        };
      });
    const transactWriteCmd = new TransactWriteCommand({
      TransactItems: transactionBody,
    });
    await this.docClient.send(transactWriteCmd);
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

  private async prepareQueryCmd(dto: GetBlogMetadataDto) {
    const params = new QueryCommand({
      TableName: AwsBlogMetadataService.blogMetadataTableName,
      IndexName: AwsBlogMetadataService.languageCodeIndex,
      KeyConditionExpression: '#lang = :lang',
      FilterExpression:
        'attribute_not_exists(isDeleted) OR isDeleted = :isDeleted',
      Limit: dto.pageSize ?? 5,
      ExpressionAttributeNames: {
        '#lang': 'LanguageCode',
      },
      ExpressionAttributeValues: {
        ':lang': dto.languageCode,
        ':isDeleted': false,
      },
      ScanIndexForward: false,
      ExclusiveStartKey: dto.cursor
        ? JSON.parse(decodeURIComponent(dto.cursor))
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
    if (blogMetadata.Description) {
      expr += ', description=:description';
      values[':description'] = blogMetadata.Description;
    }
    return new UpdateCommand({
      Key: { PostId: blogMetadata.PostId },
      TableName: AwsBlogMetadataService.blogMetadataTableName,
      UpdateExpression: expr,
      ExpressionAttributeValues: values,
    });
  }
  private static get languageCodeIndex() {
    return 'LanguageCodeIndex';
  }
}
