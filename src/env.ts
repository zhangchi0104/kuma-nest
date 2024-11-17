import { cleanEnv, str } from 'envalid';
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
  SLS_STAGE: str({
    default: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
  }),
  JWT_PUBLIC_KEY: str({
    default: '',
  }),
  IS_LOCAL: str({ default: 'false' }),
});

export default env;
