import { S3ServiceException } from '@aws-sdk/client-s3';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Catch(S3ServiceException)
export class S3ServiceExceptionFilter implements ExceptionFilter {
  catch(exception: S3ServiceException, host: ArgumentsHost) {
    console.error('S3ServiceExceptionFilter', exception);
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    if (exception.name === 'NoSuchKey') {
      throw new NotFoundException({
        message: 'The requested resource was not found',
        cause: exception,
        data: {
          url: request.url,
          method: request.method,
        },
      });
    }

    throw new InternalServerErrorException({
      message: 'An error occurred with the S3 service',
      cause: exception,
      data: {
        url: request.url,
        method: request.method,
      },
    });
  }
}
