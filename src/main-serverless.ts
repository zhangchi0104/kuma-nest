import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { bootstrap } from './init';

let server: Handler | null = null;

async function main(): Promise<Handler> {
  const app = await bootstrap();
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await main());
  return server(event, context, callback);
};
