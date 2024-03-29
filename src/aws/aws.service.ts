import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import env from 'src/env';

@Injectable()
export class AwsService {
  private s3: AWS.S3;
  constructor() {
    AWS.config.update({ region: env.AWS_ACCOUNT_REGION });
    this.s3 = new AWS.S3();
  }
  async test() {
    const s3ContentBucketTest = await this.testS3ContentBucket();
    const assetBucketTest = await this.testAssetBucket();
    const dynamoDBTest = await this.testDynamoDB();
    return { ...s3ContentBucketTest, ...assetBucketTest, ...dynamoDBTest };
  }
  private async testS3ContentBucket() {
    const s3 = this.s3;

    let putContentBucketResult = 'Success';
    // S3:PutObject
    await s3
      .putObject({
        Bucket: env.AWS_S3_CONTENT_BUCKET,
        Key: 'test.txt',
        Body: 'Hello World!',
      })
      .promise()
      .catch(() => (putContentBucketResult = 'Failed'));
    await s3
      .putObject({
        Bucket: env.AWS_S3_CONTENT_BUCKET,
        Key: 'test1.txt',
        Body: 'Hello World!',
      })
      .promise()
      .catch(() => {});
    let listContentBucketResult = 'Success';
    // S3:ListObjects
    await s3
      .listObjectsV2({ Bucket: env.AWS_S3_CONTENT_BUCKET })
      .promise()
      .catch(() => (listContentBucketResult = 'Failed'));
    let deleteContentBucketResult = 'Success';
    // S3:DeleteObject
    await s3
      .deleteObject({ Bucket: env.AWS_S3_CONTENT_BUCKET, Key: 'test.txt' })
      .promise()
      .catch(() => (deleteContentBucketResult = 'Failed'));

    return {
      [`${env.AWS_S3_CONTENT_BUCKET} PutObject`]: putContentBucketResult,
      [`${env.AWS_S3_CONTENT_BUCKET} ListObjects`]: listContentBucketResult,
      [`${env.AWS_S3_CONTENT_BUCKET} DeleteObject`]: deleteContentBucketResult,
    };
  }
  private async testAssetBucket() {
    const s3 = this.s3;
    let putAssetBucketResult = 'Success';
    // S3:PutObject
    await s3
      .putObject({
        Bucket: env.AWS_S3_ASSET_BUCKET,
        Key: 'test.txt',
        Body: 'Hello World!',
      })
      .promise()
      .catch(() => (putAssetBucketResult = 'Failed'));
    await s3
      .putObject({
        Bucket: env.AWS_S3_ASSET_BUCKET,
        Key: 'test.txt',
        Body: 'Hello World!',
      })
      .promise()
      .catch(() => (putAssetBucketResult = 'Failed'));
    // S3:DeleteObject
    let deleteAssetBucketResult = 'Success';
    await s3
      .deleteObject({ Bucket: env.AWS_S3_ASSET_BUCKET, Key: 'test.txt' })
      .promise()
      .catch(() => (deleteAssetBucketResult = 'Failed'));
    // S3:ListObjects
    let listAssetBucketResult = 'Success';
    await s3
      .listObjectsV2({ Bucket: env.AWS_S3_ASSET_BUCKET })
      .promise()
      .catch(() => (listAssetBucketResult = 'Failed'));
    return {
      [`${env.AWS_S3_ASSET_BUCKET} PutObject`]: putAssetBucketResult,
      [`${env.AWS_S3_ASSET_BUCKET} DeleteObject`]: deleteAssetBucketResult,
      [`${env.AWS_S3_ASSET_BUCKET} ListObjects`]: listAssetBucketResult,
    };
  }
  private async testDynamoDB() {
    return {};
  }
}
