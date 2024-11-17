import { bootstrap } from './init';
import { isRunningLocal } from './utils/utils.constants';

async function main() {
  const port = process.env.PORT || 8000;
  if (isRunningLocal) {
    console.log('============================');
    console.log('Running in local dev mode.');
    console.log('============================\n');
  }
  console.log('Starting server on http://localhost:' + port.toString());
  const app = await bootstrap();
  await app.listen(8000);
}
main();
