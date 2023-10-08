import { chromium } from "playwright";
import { commonSetting } from "../common";

export async function NinehireLoginCheck(email: string, password: string) {
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
    await page.goto("https://app.ninehire.com/login");
    console.log("1");

    // 이메일 입력
    await (
      await page.waitForSelector(".LabelInput__Input-sc-38583531-4.kqaLiD")
    ).type(email);
    console.log("2");

    // 비밀번호 입력
    await (
      await page.waitForSelector(".LabelInput__Input-sc-38583531-4.kgpWbg")
    ).type(password);
    console.log("3");

    // 로그인 버튼 클릭
    const submitButton = await page.waitForSelector(
      ".Button-sc-37786504-0.login__LoginButton-sc-e12edbee-8.eDiVOZ.KGgOm",
    );

    await submitButton.click();

    console.log("4");

    // 잠시 대기
    await page.waitForTimeout(1000); //혹시나 네트워크가 느린 경우에는 초를 늘려줘야함

    const isLoginFailVisible = await page
      .locator(".LabelInput__ErrorString-sc-38583531-5.fZtsos", {
        hasText: "잘못된 로그인 정보입니다. 로그인 정보를 확인해 주세요.",
      })
      .isVisible();
    console.log("===========> ~ isLoginFailVisible:", isLoginFailVisible);

    if (!isLoginFailVisible) {
      throw new Error("잘못된 로그인 정보입니다. 로그인 정보를 확인해 주세요.");
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
