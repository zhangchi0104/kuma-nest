import { cleanEnv, str } from 'envalid';
import { config } from 'dotenv';
if (!process.env.AWS_EXECUTION_ENV) {
  config({ path: ['.env', '.env.development'] });
}
const env = cleanEnv(process.env, {
  BLOG_METADATA_TABLE: str(),
  AWS_ACCOUNT_REGION: str({ default: 'ap-southeast-2' }),
  BLOG_CONTENT_BUCKET: str(),
  BLOG_ASSETS_BUCKET: str(),
  AWS_ACCESS_KEY_ID: str({
    default: '',
  }),
  AWS_SECRET_ACCESS_KEY: str({
    default: '',
  }),
  SLS_STAGE: str(),
  JWT_PUBLIC_KEY: str(),
});

export default env;
