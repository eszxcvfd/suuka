import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const code = this.resolveCode(exception, status);
    const message = this.resolveMessage(exception, status);

    this.logException(exception, request, status, code, message);

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        status,
      },
      timestamp: new Date().toISOString(),
    });
  }

  private logException(
    exception: unknown,
    request: Request,
    status: number,
    code: string,
    message: string,
  ): void {
    const prefix = `[HTTP ${status}] ${request.method} ${request.originalUrl}`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error = exception instanceof Error ? exception : new Error(String(exception));
      console.error(prefix, {
        code,
        message,
        name: error.name,
        stack: error.stack,
      });
      return;
    }

    console.warn(prefix, { code, message });
  }

  private resolveMessage(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        return payload;
      }

      if (payload && typeof payload === 'object') {
        const maybeMessage = (payload as { message?: string | string[] }).message;
        if (Array.isArray(maybeMessage)) {
          return maybeMessage.join(', ');
        }
        if (typeof maybeMessage === 'string') {
          return maybeMessage;
        }
      }

      return exception.message;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Internal server error';
    }

    return 'Request failed';
  }

  private resolveCode(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (payload && typeof payload === 'object') {
        const maybeCode = (payload as { code?: string }).code;
        if (typeof maybeCode === 'string' && maybeCode.length > 0) {
          return maybeCode;
        }
      }
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'INTERNAL_SERVER_ERROR';
    }

    return 'REQUEST_FAILED';
  }
}
