import { Elysia } from 'elysia';
import { HttpError } from './errors';
import { postsRoutes } from './features/posts/with-dynamo';
import logger from './plugins/requestLogger';

const gloablErrorHandler = () =>
  new Elysia()
    .error({
      httpError: HttpError,
    })
    .onError(({ code, error }) => {
      console.error(`Error ${code} - ${error.message}`);
      switch (code) {
        case 'httpError':
          return {
            statusCode: error.status,
            body: error.message,
          };
      }
    });
const app = new Elysia()
  .use(gloablErrorHandler)
  .use(logger)
  .use(postsRoutes)
  .get('/health', () => new Date().toString())
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
