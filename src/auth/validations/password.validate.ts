/* password 인증작업 */
import * as argon from "argon2";

export const validatePassword = async (
  hashedPassword: string,
  plainPassword: string,
) => await argon.verify(hashedPassword, plainPassword);
