import { HttpStatus } from "@nestjs/common";

export class AuthException extends Error {
  constructor(
    message: string,
    public httpStatus: HttpStatus,
  ) {
    super(message);
    this.message = message;
    this.httpStatus = httpStatus;
  }
}
