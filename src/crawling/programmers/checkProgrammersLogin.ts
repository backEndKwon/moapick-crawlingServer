import { chromium } from "playwright";

const buttonSelector = {
  idInput: "input[name='user[email]']",
  passwordInput: "input[name='user[password]']",
  submitButton: 'input[name="commit"]',
  companyButton: "button:has-text('기업회원')",
};

export async function programmersLoginCheck(ID: string, PW: string) {
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
    await page.goto("https://business.programmers.co.kr/business/login");

    await (await page.waitForSelector(buttonSelector.idInput)).fill(ID);

    await (await page.waitForSelector(buttonSelector.passwordInput)).fill(PW);
    await (await page.waitForSelector(buttonSelector.submitButton)).click();

    await page.waitForTimeout(1000);
    const isFailToLogin = await page
      .locator("span.zrqIfD9Zb-9c7glnjTFOi")
      .isVisible();

    if (isFailToLogin) {
      throw new Error("로그인 실패");
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
