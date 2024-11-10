import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogger');
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, httpVersion } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      this.logger.log(
        `${method} (${duration}ms) HTTP${httpVersion} ${statusCode} ${originalUrl}`,
      );
    });

    next();
  }
}
