import { cleanEnv, str } from 'envalid';
import { config } from 'dotenv';
if (!process.env['RUNTIME_ENV']) {
  config({ path: '.env.dev' });
}
const env = cleanEnv(process.env, {
  AWS_DYNAMODB_TABLE_NAME: str(),
  AWS_ACCOUNT_REGION: str(),
  AWS_S3_CONTENT_BUCKET: str(),
  AWS_S3_ASSET_BUCKET: str(),
  RUNTIME_ENV: str(),
  AWS_ACCESS_KEY_ID: str({
    default: '',
  }),
  AWS_SECRET_ACCESS_KEY: str({
    default: '',
  }),
});

export default env;
