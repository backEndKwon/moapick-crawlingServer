import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message;

    response
      .status(status)
      .json({
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      const err = `{\n   [오류메세지] : ${message} \n   [statusCode] : ${status}\n   [path] : ${request.url}\n}`
      console.log(err)
  }
}