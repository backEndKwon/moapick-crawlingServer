import { chromium, Page } from "playwright";
import { uploadFileDownload, uploadFilePreview } from "../../lib/aws";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as XLSX from "xlsx";
import axios from "axios";
import * as dayjs from "dayjs";
import * as customParseFormat from "dayjs/plugin/customParseFormat";
import { HttpException, HttpStatus } from "@nestjs/common";

dayjs.extend(customParseFormat);

interface UserInfo {
  포지션: string;
  "지원 상태": string;
  이름: string;
  이메일: string;
  지원일: number;
  링크: string;
}

const buttonSelector = {
  idInput: "input[name='user[email]']",
  passwordInput: "input[name='user[password]']",
  submitButton: 'input[name="commit"]',
  companyButton: "button:has-text('기업회원')",
};

//포트폴리오 다운도르
export const downloadPdf = async (url: string, outputPath: string) => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(outputPath, response.data);
  } catch (error) {
    throw new HttpException(
      "Failed to download PDF",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

//로그인
async function login(page: Page, ID: string, PW: string) {
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
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

//채용공고로 이동
async function navigateJobPostings(page: Page) {
  await page.goto("https://business.programmers.co.kr/job_positions");
  await page.locator("button:has-text('닫기')").click();
}

async function downloadExcel(page: Page) {
  const test = await page.$(
    "#section_applications > div.position-control-panel > div > a",
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    await test.click(),
  ]);

  const fileName = await download.suggestedFilename();
  const downloadPath = path.join(os.homedir(), fileName);
  await download.saveAs(downloadPath);
  return downloadPath;
}

async function getAllApplicantsHrefs(filePath: string): Promise<string[]> {
  const workbook = XLSX.readFile(filePath);

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const data: UserInfo[] = XLSX.utils.sheet_to_json(worksheet);
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.log(error);
  }

  return data
    .filter((row) => row["지원 상태"] === "신규")
    .map((row) => row["링크"]);
}

const getPageElement = async (page: Page, selector: string) => {
  return await page.$eval(selector, (element) => element.textContent?.trim());
};

async function saveApplicantResumesAndReturnResult(
  page: Page,
  hrefs: string[],
) {
  let allUserInfo = [];
  const homeDirectory = os.homedir();

  for (let href of hrefs) {
    let downloadUrls = [];
    let previewUrls = [];
    await page.goto(href);
    let userInfo = {};

    await page.waitForURL(href);
    await page.waitForTimeout(1000);

    // 이름
    const name = await getPageElement(page, "h1._1uhyBbJhQX9oo4LIeb1HeQ");

    // 이메일
    const email = await getPageElement(page, "li.email > a");
    //전화번호
    const phone = await getPageElement(page, "li.tel > a");

    //포지션
    const position = await getPageElement(
      page,
      "div._1hDMj19-cNvk1I_7LpMkNw span.badge",
    );

    //지원 시간
    const applyDate = await getPageElement(
      page,
      "#job-application-display > div > div.resume__summary > section.position-control > ul > li:nth-child(2) > span.badge",
    );
    console.log(
      "🚀 ~ file: programmersCrawling.ts:150 ~ applyDate:",
      applyDate,
    );

    const parsedDate = dayjs(applyDate, "YY년 MM월 DD일 HH:mm", "ko");
    const formatedDate = parsedDate.format("YYYY-MM-DDTHH:mm:ss");
    console.log(
      "🚀 ~ file: programmersCrawling.ts:158 ~ formatedDate:",
      formatedDate,
    );
    //첨부파일
    //TODO: 첨부파일이 없는 경우 예외처리
    const hasPortpolio = await page
      .locator("a._1NtFB7aKK7N1b4YJxa4kEW")
      .isVisible();

    const resumeName = `${name}_이력서.pdf`;

    if (hasPortpolio) {
      const portpolio = await page.$eval("a._1NtFB7aKK7N1b4YJxa4kEW", (el) =>
        el.getAttribute("href"),
      );
      const outputPath = path.join(
        homeDirectory,
        `./${name}_${position}_이력서.pdf`,
      );
      await downloadPdf(portpolio, outputPath);

      //이력서 이름

      const pdfPath = path.join(homeDirectory, resumeName);

      await page.pdf({ path: pdfPath, format: "A4" });

      const [downloadUrl, previewUrl, fileDownloadUrl, filePreviewUrl] =
        await Promise.all([
          uploadFileDownload(pdfPath),
          uploadFilePreview(pdfPath),
          uploadFileDownload(outputPath),
          uploadFilePreview(outputPath),
        ]);

      downloadUrls.push(downloadUrl, fileDownloadUrl);
      previewUrls.push(previewUrl, filePreviewUrl);
      try {
        fs.unlinkSync(pdfPath);
        fs.unlinkSync(outputPath);
      } catch (error) {
        console.log(error);
      }
    } else {
      const pdfPath = path.join(homeDirectory, resumeName);

      await page.pdf({ path: pdfPath, format: "A4" });

      const [downloadUrl, previewUrl] = await Promise.all([
        uploadFileDownload(pdfPath),
        uploadFilePreview(pdfPath),
      ]);

      downloadUrls.push(downloadUrl);
      previewUrls.push(previewUrl);
      try {
        fs.unlinkSync(pdfPath);
      } catch (error) {
        console.log(error);
      }
    }

    userInfo["name"] = name;
    userInfo["name"] = name;
    userInfo["email"] = email;
    userInfo["mobile"] = phone;
    userInfo["filePath"] = downloadUrls;
    userInfo["previewPath"] = previewUrls;
    userInfo["position"] = position;
    userInfo["chk_time"] = formatedDate;
    userInfo["file_name"] = resumeName;

    allUserInfo.push(userInfo);
  }
  return allUserInfo;
}

export async function programmersCrawling(ID: string, PW: string) {
  const browser = await chromium.launch({
    headless: false,
  });
  const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
  const context = await browser.newContext({ userAgent });
  context.setDefaultNavigationTimeout(0);
  context.setDefaultTimeout(0);

  const page = await context.newPage();
  // Log in
  await login(page, ID, PW);

  await navigateJobPostings(page);

  const downloadPath = await downloadExcel(page);
  const hrefs = await getAllApplicantsHrefs(downloadPath);

  const result = await saveApplicantResumesAndReturnResult(
    page,
    hrefs.slice(0, 5),
  );

  await browser.close();
  return result;
}
