import { chromium } from "playwright";
import { commonSetting } from "../common";

const buttonSelector = {
  idInput: "input[name='id']",
  passwordInput: "input[name='password']",
  submitButton: 'button:has-text("로그인")',
  companyButton: "button:has-text('기업회원')",
};

export async function saraminLoginCheck(ID: string, PW: string) {
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
    await page.goto("https://www.saramin.co.kr/zf_user/auth");
    const companyButton = await page.waitForSelector(
      buttonSelector.companyButton,
    );

    await companyButton.click();

    await (await page.waitForSelector(buttonSelector.idInput)).fill(ID);

    await (await page.waitForSelector(buttonSelector.passwordInput)).fill(PW);
    await (await page.waitForSelector(buttonSelector.submitButton)).click();

    const mainUrl = "https://www.saramin.co.kr/zf_user/memcom/index/main";

    if ((await page.url()) !== mainUrl) {
      console.log(await page.url());
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
