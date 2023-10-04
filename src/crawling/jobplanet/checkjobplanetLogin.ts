import { chromium } from "playwright";

const buttonSelector = {
  emailInput: "input[name='user[email]']",
  passwordInput: "input[name='user[password]']", // 실제 비밀번호 입력 필드의 selector로 변경해야 합니다.
  submitButton: 'button.btn_sign_up[type="submit"]', //class명[ type = 명칭]
};

export async function JobplanetLoginCheck(email: string, password: string) {
  const browser = await chromium.launch({
    headless: true,
  });

  const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
  const context = await browser.newContext({ userAgent });
  context.setDefaultNavigationTimeout(0);
  context.setDefaultTimeout(0);

  const page = await context.newPage();

  try {
    await page.goto("https://www.jobplanet.co.kr/users/sign_in?_nav=gb");
    console.log("1");

    // 이메일 입력
    await (await page.waitForSelector(buttonSelector.emailInput)).type(email);
    console.log("2");

    // 비밀번호 입력
    await (
      await page.waitForSelector(buttonSelector.passwordInput)
    ).type(password);
    console.log("3");

    // 로그인 버튼 클릭 전에 참조 저장
    const submitButton = await page.waitForSelector(
      buttonSelector.submitButton,
    );

    // 로그인 시도
    await submitButton.click();
    console.log("4");

    await page.waitForTimeout(2000);
    let failureMessageElement;
    failureMessageElement = await page.$(".txt.ico_email_w");
    if (failureMessageElement) {
      console.log("로그인 실패");
      await browser.close();
      return false;
    }
    console.log("로그인 성공");
    await browser.close();
    return true;

  } catch (error) {
    console.error(error);
    console.log("8");
    await browser.close();
    console.log("try-catch, 로그인 실패");
    return false;
  }
}
