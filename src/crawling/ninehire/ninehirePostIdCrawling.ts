import { chromium } from "playwright";
import { config } from "dotenv";
import { uploadFileDownload, uploadFilePreview } from "../../lib/aws";
import * as fs from "fs";

config();

const buttonSelector = {
  emailInput: "input[name='email']",
  passwordInput: "input[name='password']",
  submitButton: 'button[type="submit"]',
};

//로그인
export async function login(page, ID: string, PW: string) {
  try {
    await page.goto("https://app.ninehire.com/login");

    await (
      await page.waitForSelector(".LabelInput__Input-sc-38583531-4.kqaLiD")
    ).type(ID);

    await (
      await page.waitForSelector(".LabelInput__Input-sc-38583531-4.kgpWbg")
    ).type(PW);
    const submitButton = await page.waitForSelector(
      ".Button-sc-37786504-0.login__LoginButton-sc-e12edbee-8.eDiVOZ.KGgOm",
    );

    // 로그인 시도
    await submitButton.click();
    console.log("로그인 성공");

    await page.waitForNavigation();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// 채용관리 페이지
async function findOpeningPostId(page) {
  try {
    console.log("navigateJobPostings 진행중");
    await page.goto("https://app.ninehire.com/7jXUqMTN/recruitment?status=all");
    await page.waitForTimeout(2000);
    const positionIds = await page.$$eval(
      ".RecruitmentListItem__Container-sc-ae79e383-0.kvIjDz.recruitment_list_item_in_progress",
      (elements) =>
        elements.map((element) => {
          const linkElement = element.querySelector("a");
          console.log("===========> ~ linkElement:", linkElement);
          if (linkElement) {
            const href = linkElement.getAttribute("href");
            const idPart = href.split("/");
            return idPart[idPart.length - 2];
          }
        }),
    );

    console.log("===========> ~ positionIds:", positionIds);
    return positionIds;
  } catch (error) {
    console.log(error);
  }
}

export async function CrawlingNinehirePostId(ID, PW) {
  const browser = await chromium.launch({
    headless: true,
  });
  const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
  const context = await browser.newContext({ userAgent });
  context.setDefaultNavigationTimeout(0);
  context.setDefaultTimeout(0);

  const page = await context.newPage();
  // Log in
  await login(page, ID, PW);
  const postIds = await findOpeningPostId(page);
  return postIds;
}
