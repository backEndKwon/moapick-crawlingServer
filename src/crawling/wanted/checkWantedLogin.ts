import { chromium } from "playwright";
import { commonSetting } from "../common";

const buttonSelector = {
  emailInput: "input[name='email']",
  passwordInput: "input[name='password']",
  submitButton: 'button[type="submit"]',
};

export async function wantedLoginCheck(ID: string, PW: string) {
  const browser = await chromium.launch({
    headless: commonSetting,
  });
  const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
  const context = await browser.newContext({ userAgent });
  context.setDefaultNavigationTimeout(0);
  context.setDefaultTimeout(0);

  const page = await context.newPage();
  try {
    await page.goto("https://id.wanted.jobs/login");

    await (await page.waitForSelector(buttonSelector.emailInput)).type(ID);
    await (await page.waitForSelector(buttonSelector.submitButton)).click();

    //아이디 일치하는지 체크
    await page.waitForTimeout(1000);
    console.log("아이디 체크");
    const isSignupVisible = await page
      .locator("p:has-text('회원가입')")
      .isVisible();

    if (isSignupVisible) {
      throw new Error("존재하지 않는 아이디입니다.");
    }

    await page.waitForTimeout(1000);
    await (await page.waitForSelector(buttonSelector.passwordInput)).type(PW);
    await (await page.waitForSelector(buttonSelector.submitButton)).click();

    //비밀번호 맞는지 체크
    console.log("비밀번호 체크");
    await page.waitForTimeout(2000);
    // // 로컬에서는 "비밀번호가 일치하지 않습니다."
    // const isWrongPassWordVisible = await page
    //   .locator(".css-1u2lazp", {
    //     hasText: "비밀번호가 일치하지 않습니다.",
    //   })
    //   .isVisible();
    // 서버에서는 "Password does not match"
    const isWrongPassWordVisible = await page
      .locator(".css-1u2lazp", {
        hasText: "Password does not match",
      })
      .isVisible();

    if (isWrongPassWordVisible) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

    console.log("로그인 성공");
    await browser.close();
    return true;
  } catch (error) {
    console.log(error);
    await browser.close();
    return false;
  }
}
