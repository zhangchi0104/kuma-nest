import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { Catch, ExceptionFilter } from '@nestjs/common';
@Catch(DynamoDBServiceException)
export class DynamoDBServiceExceptionFilter implements ExceptionFilter {
  catch(exception: DynamoDBServiceException) {
    console.error('DynamoDBServiceExceptionFilter', exception);
    throw exception;
  }
}
