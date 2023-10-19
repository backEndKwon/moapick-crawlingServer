import { PipeTransform, Injectable } from "@nestjs/common";
import { dtoEmailException } from "src/common/exceptions/dto-Exception";

@Injectable()
export class UserBodyDataValidationPipe implements PipeTransform {
  transform(value: any) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (value.email) {
      if (!emailRegex.test(value.email)) {
        throw new dtoEmailException();
      }
    }
    return value;
  }
}
