/* 
httpexception, httpstatus를 import한 후 ,
상황별 custom exception을 만들기
 */
import { HttpException, HttpStatus } from "@nestjs/common";
export class dtoEmailException extends HttpException {
  constructor() {
    super("이메일을 입력해주세요",HttpStatus.BAD_REQUEST);
  }
}
