import { cleanEnv, str } from 'envalid';

const env = cleanEnv(process.env, {
  DYNAMODB_TABLE_NAME: str(),
  AWS_ACCOUNT_REGION: str(),
  AWS_S3_CONTENT_BUCKET: str(),
  AWS_S3_ASSET_BUCKET: str(),
});

export default env;
