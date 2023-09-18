import { chromium } from 'playwright';

const buttonSelector = {
  emailInput: "input[name='email']",
  passwordInput: "input[name='password']", // 실제 비밀번호 입력 필드의 selector로 변경해야 합니다.
  submitButton: 'button[type="submit"]',
};

export async function CheckRocketPunchLogin(email: string, password: string) {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  try {
    await page.goto('https://www.rocketpunch.com/login');

    // 이메일 입력
    await (await page.waitForSelector(buttonSelector.emailInput)).type(email);

    // 비밀번호 입력
    await (
      await page.waitForSelector(buttonSelector.passwordInput)
    ).type(password);

    // 로그인 버튼 클릭
    await (await page.waitForSelector(buttonSelector.submitButton)).click();

    //     // 성공 메시지 확인
    //     console.log('로그인 체크');

    await page.waitForTimeout(1000);
    const loginErrorMessage = await page
      .locator('#global-messages p')
      .textContent();

    if (loginErrorMessage === '로그인 정보를 확인해 주세요.') {
      await browser.close();
      console.log('로그인 실패');
      return false;
    }
    console.log('로그인 성공');

    await browser.close();
    return true;
  } catch (error) {
    console.log(error);
    await browser.close();
    console.log('try-catch, 로그인 실패');
    return false;
  }
}
