import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorName = exception.name;
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const obj = payload as Record<string, unknown>;
        message = (obj['message'] as string | string[]) ?? exception.message;
        errorName = (obj['error'] as string) ?? exception.name;
        details = obj['details'] ?? obj['errors'];
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name;
      this.logger.error(`Unhandled error on ${req.method} ${req.path}: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unknown exception on ${req.method} ${req.path}: ${String(exception)}`);
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };
    if (details !== undefined) body.details = details;

    res.status(status).json(body);
  }
}
