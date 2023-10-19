import { HttpException, HttpStatus } from "@nestjs/common";

export class EmailException extends HttpException {
  constructor() {
    super("이메일을 입력해주세요.", HttpStatus.BAD_REQUEST);
  }
}
export class PhoneNumberException extends HttpException {
  constructor() {
    super("전화번호를 입력해주세요.", HttpStatus.BAD_REQUEST);
  }
}
export class PasswordException extends HttpException {
  constructor() {
    super("비밀번호를 입력해주세요.", HttpStatus.BAD_REQUEST);
  }
}

export class CompanyNameException extends HttpException {
  constructor() {
    super("회사명을 입력해주세요.", HttpStatus.BAD_REQUEST);
  }
}
export class EidException extends HttpException {
  constructor() {
    super("사업자번호를 입력해주세요.", HttpStatus.BAD_REQUEST);
  }
}
export class LimitCreateCompanyAccountException extends HttpException {
  constructor() {
    super(
      "회사당 하나의 계정만 생성 가능합니다. 기타 문의사항은 채널톡으로 문의부탁드립니다.",
      HttpStatus.BAD_REQUEST,
    );
  }
}
export class ExistUserException extends HttpException {
  constructor() {
    super("이미 존재하는 계정입니다.", HttpStatus.BAD_REQUEST);
  }
}
export class NotExistUserException extends HttpException {
  constructor() {
    super("존재하지 않는 사용자입니다.", HttpStatus.BAD_REQUEST);
  }
}

export class NotExistCompanyException extends HttpException {
  constructor() {
    super("존재하지 않는 회사입니다.", HttpStatus.BAD_REQUEST);
  }
}

/* 모든 요청에 실패했을때 */
export class CommonException extends HttpException {
  constructor() {
    super("요청에 실패했습니다.", HttpStatus.BAD_REQUEST);
  }
} 