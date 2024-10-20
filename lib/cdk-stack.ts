import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
interface LambdaProps {
  contentBucket: cdk.aws_s3.Bucket;
  assetsBucket: cdk.aws_s3.Bucket;
  matedataTable: cdk.aws_dynamodb.TableV2;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const envName =
      process.env.NODE_ENV || process.env.NODE_ENV === 'production'
        ? 'prod'
        : 'dev';
    // The code that defines your stack goes here
    const contentBucket = new cdk.aws_s3.Bucket(this, 'BlogContentBucket', {
      bucketName: `alexz-blog-content-${envName}-${process.env.CDK_REGION || 'ap-southeast-2'}`,
    });
    const assetsBucket = new cdk.aws_s3.Bucket(this, 'BlogAssetsBucket', {
      bucketName: `alexz-blog-assets-${envName}-${process.env.CDK_REGION || 'ap-southeast-2'}`,
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });

    const metadataTable = new cdk.aws_dynamodb.TableV2(
      this,
      'BlogMetadataTable',
      {
        tableName: `blog-metadata-${envName}`,
        partitionKey: {
          name: 'id',
          type: cdk.aws_dynamodb.AttributeType.STRING,
        },
      },
    );
    this.createLambda({
      contentBucket: contentBucket,
      assetsBucket: assetsBucket,
      matedataTable: metadataTable,
    });

    new cdk.CfnOutput(this, 'ContentBucketOutput', {
      key: 'ContentBucketName',
      value: contentBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'AssetsBucketOutput', {
      key: 'AssetsBucketName',
      value: assetsBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'MetadataTableOutput', {
      key: 'MetadataTableName',
      value: metadataTable.tableName,
    });
    new cdk.CfnOutput(this, 'ContentBucketArnOutput', {
      key: 'ContentBucketArn',
      value: contentBucket.bucketArn,
    });
    new cdk.CfnOutput(this, 'AssetsBucketArnOutput', {
      key: 'AssetsBucketArn',
      value: assetsBucket.bucketArn,
    });
    new cdk.CfnOutput(this, 'MetadataTableArnOutput', {
      key: 'MetadataTableArn',
      value: metadataTable.tableArn,
    });
  }

  createLambda(props: LambdaProps) {
    const lambda = new cdk.aws_lambda.Function(this, 'BlogLambda', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: cdk.aws_lambda.Code.fromAsset('dist'),
      environment: {
        BLOG_METADATA_TABLE: props.matedataTable.tableName,
        BLOG_CONTENT_BUCKET: props.contentBucket.bucketName,
        BLOG_ASSETS_BUCKET: props.assetsBucket.bucketName,
        JWT_PUBLIC_KEY: process.env.CLERK_PUBLIC_KEY || '',
      },
    });
    //const dockerfilePath = path.join(__dirname, '..');
    //const lambda = new cdk.aws_lambda.DockerImageFunction(this, 'BlogLambda', {
    //  code: cdk.aws_lambda.DockerImageCode.fromImageAsset(dockerfilePath),
    //  functionName: `BlogLambda-${this.envName}`,
    //  environment: {
    //    BLOG_METADATA_TABLE: props.matedataTable.tableName,
    //    BLOG_CONTENT_BUCKET: props.contentBucket.bucketName,
    //    BLOG_ASSETS_BUCKET: props.assetsBucket.bucketName,
    //    JWT_PUBLIC_KEY: process.env.CLERK_PUBLIC_KEY || '',
    //  },
    //});
    props.contentBucket.grantReadWrite(lambda);
    props.assetsBucket.grantReadWrite(lambda);
    props.matedataTable.grantReadWriteData(lambda);

    const certificate =
      cdk.aws_certificatemanager.Certificate.fromCertificateArn(
        this,
        'DomainCertificate',
        process.env.CERTIFICATE_ARN || '',
      );

    const apiGateway = new cdk.aws_apigateway.LambdaRestApi(
      this,
      'BlogApiGateway',
      {
        handler: lambda,
        proxy: true,
        domainName: {
          domainName: `${this.envName}.api.chiz.dev`,
          certificate: certificate,
          endpointType: cdk.aws_apigateway.EndpointType.REGIONAL,
        },
        deploy: true,
        deployOptions: {
          stageName: this.envName,
        },
      },
    );
    const zone = cdk.aws_route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'api.chiz.dev',
    });
    new cdk.aws_route53.ARecord(this, 'ApiGatewayAliasRecord', {
      zone,
      recordName: `${this.envName}`,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.ApiGateway(apiGateway),
      ),
    });

    new cdk.CfnOutput(this, 'ApiGatewayCustomUrlOutput', {
      key: 'ApiGatewayCustomUrl',
      value: apiGateway.domainName?.domainName || 'unknown',
    });
    new cdk.CfnOutput(this, 'ApiGatewayUrlOutput', {
      key: 'ApiGatewayUrl',
      value: apiGateway.url,
    });
    return lambda;
  }
  private get envName() {
    return process.env.NODE_ENV && process.env.NODE_ENV === 'production'
      ? 'prod'
      : 'dev';
  }
}
