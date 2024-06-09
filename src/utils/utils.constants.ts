export const isRunningLocal =
  process.env.IS_OFFLINE === 'true' || !process.env.AWS_EXECUTION_ENV;
