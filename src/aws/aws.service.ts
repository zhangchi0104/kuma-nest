import { Injectable } from '@nestjs/common';
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
  QueryCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import env from 'src/env';
import { isRunningLocal } from '../utils/utils.helpers';
@Injectable()
export class AwsService {
  private s3: S3Client;
  private dynamoDb: DynamoDBClient;
  constructor() {
    this.s3 = isRunningLocal
      ? new S3Client({
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          },
        })
      : new S3Client({});

    this.dynamoDb = isRunningLocal
      ? new DynamoDBClient({
          credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          },
          region: env.AWS_ACCOUNT_REGION,
        })
      : new DynamoDBClient({});
  }

  async test() {
    const s3ContentBucketTest = await this.testS3Bucket(
      env.AWS_S3_CONTENT_BUCKET,
    );
    const assetBucketTest = await this.testS3Bucket(env.AWS_S3_ASSET_BUCKET);
    const dynamoDBTest = await this.testDynamoDB();
    return { ...s3ContentBucketTest, ...assetBucketTest, ...dynamoDBTest };
  }

  private async testS3Bucket(bucketName: string) {
    const s3 = this.s3;

    let putContentBucketResult = 'Success';
    // S3:PutObject
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test.txt',
      Body: 'Hello World!',
    });
    await s3.send(putCommand).catch(() => (putContentBucketResult = 'Failed'));
    // s3:GetObject
    let getContentBucketResult = 'Success';
    await s3
      .send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: 'test.txt',
        }),
      )
      .catch(() => {
        getContentBucketResult = 'Failed';
      });
    let listContentBucketResult = 'Success';
    // S3:ListObjects
    const listObjectsCommand = new ListObjectsCommand({
      Bucket: bucketName,
    });
    await s3
      .send(listObjectsCommand)
      .catch(() => (listContentBucketResult = 'Failed'));
    let deleteContentBucketResult = 'Success';
    // S3:DeleteObject
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: 'test.txt',
    });
    await s3
      .send(deleteObjectCommand)
      .catch(() => (deleteContentBucketResult = 'Failed'));

    return {
      [`${bucketName} PutObject`]: putContentBucketResult,
      [`${bucketName} ListObjects`]: listContentBucketResult,
      [`${bucketName} DeleteObject`]: deleteContentBucketResult,
      [`${bucketName} GetObject`]: getContentBucketResult,
    };
  }

  private async testDynamoDB() {
    const dynamoDb = this.dynamoDb;
    const tableName = env.AWS_DYNAMODB_TABLE_NAME;
    const id = '1111';
    // DynamoDB:PutItem
    let putDynamoDBResult = 'Success';
    const putDynamoDBRequest = new PutItemCommand({
      TableName: tableName,
      Item: { message: { S: 'Hello World!111' }, id: { S: id } },
    });
    await dynamoDb
      .send(putDynamoDBRequest)
      .catch(() => (putDynamoDBResult = 'Failed'));

    // DynamoDB:UpdateItem
    let updateDynamoDBResult = 'Success';
    const updateDynamoDBRequest = new UpdateItemCommand({
      TableName: tableName,
      UpdateExpression: 'set message = :message',
      Key: {
        id: { S: id },
      },
    });
    await dynamoDb
      .send(updateDynamoDBRequest)
      .catch(() => (updateDynamoDBResult = 'Failed'));
    // DynamoDB:GetItem
    let getDynamoDBResult = 'Success';
    const getDynamoDBCommand = new GetItemCommand({
      TableName: tableName,
      Key: { id: { S: id } },
    });
    const valueAcquiredGet = await dynamoDb
      .send(getDynamoDBCommand)

      .catch(() => (getDynamoDBResult = 'Failed'));
    if (typeof valueAcquiredGet === 'string' || !valueAcquiredGet.Item) {
      getDynamoDBResult = 'Failed';
    } else {
      getDynamoDBResult =
        valueAcquiredGet.Item['message'].S === 'Hello World!111'
          ? getDynamoDBResult
          : 'Failed';
    }
    // DynamoDB:Scan
    let scanDynamoDBResult = 'Success';
    const scanDynamoDBRequest = new ScanCommand({
      TableName: tableName,
    });
    await dynamoDb
      .send(scanDynamoDBRequest)
      .catch(() => (scanDynamoDBResult = 'Failed'));
    // DynamoDB:Query
    let queryDynamoDBResult = 'Success';
    const queryDynamoDBRequest = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': { S: id },
      },
    });
    await dynamoDb
      .send(queryDynamoDBRequest)
      .catch(() => (queryDynamoDBResult = 'Failed'));
    // DynamoDB:DeleteItem
    let deleteDynamoDBResult = 'Success';
    const deleteDynamoDBRequest = new DeleteItemCommand({
      TableName: tableName,
      Key: { id: { S: id } },
    });
    await dynamoDb
      .send(deleteDynamoDBRequest)
      .catch(() => (deleteDynamoDBResult = 'Failed'));
    return {
      [`${tableName} PutItem`]: putDynamoDBResult,
      [`${tableName} GetItem`]: getDynamoDBResult,
      [`${tableName} UpdateItem`]: updateDynamoDBResult,
      [`${tableName} Scan`]: scanDynamoDBResult,
      [`${tableName} Query`]: queryDynamoDBResult,
      [`${tableName} DeleteItem`]: deleteDynamoDBResult,
    };
  }
}
