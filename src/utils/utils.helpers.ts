import env from '../env';
export const isRunningLocal =
  process.env.IS_OFFLINE === 'true' || env.RUNTIME_ENV === 'local';
