import { chromium } from "playwright";
import { config } from "dotenv";
import { uploadFileDownload, uploadFilePreview } from "../../lib/aws";
import * as fs from "fs";
import axios from "axios";
import { HttpException, HttpStatus } from "@nestjs/common";
config();

const buttonSelector = {
  emailInput: "input[name='user[email]']",
  passwordInput: "input[name='user[password]']", // 실제 비밀번호 입력 필드의 selector로 변경해야 합니다.
  submitButton: 'button.btn_sign_up[type="submit"]', //class명[ type = 명칭]
};

//로그인
export async function login(page, ID: string, PW: string) {
  try {
    await page.goto("https://www.jobplanet.co.kr/users/sign_in?_nav=gb");

    await (await page.waitForSelector(buttonSelector.emailInput)).type(ID);
    await (await page.waitForSelector(buttonSelector.passwordInput)).type(PW);
    const submitButton = await page.waitForSelector(
      buttonSelector.submitButton,
    );

    // 로그인 시도
    await submitButton.click();

    await page.waitForNavigation();
    return true;
  } catch (error) {
    console.log("비밀번호, 아이디 입력 오류");
    console.log(error);
    return false;
  }
}

//진행중인 채용 공고페이지로 이동
async function navigateJobPostings(page) {
  await page.goto(
    // "https://b2b.jobplanet.co.kr/partners/job_management?status=opened",
    "https://b2b.jobplanet.co.kr/partners/job_management?status=all",
  );
  await page.waitForTimeout(2000);
}

/**진행중인 채용공고 아이디 가져오기*/
async function getJobPostings(page) {
  console.log("채용공고 가져오는 중");
  await page.waitForTimeout(2000);
  // 모든 <li> 요소를 선택합니다.
  const elements = await page.$$("ul.menu_list__group > li");

  let postIds = [];

  for (let element of elements) {
    // badge_empty 클래스가 없는지 확인합니다.
    const isNotClosed = !(await element.$(".jp_badge.badge_empty"));

    if (isNotClosed) {
      // a 태그 내부의 href 속성 값을 가져옵니다.
      const hrefElement = await element.$("a");
      const hrefValue = await page.evaluate(
        (el) => el.getAttribute("href"),
        hrefElement,
      );

      // postId를 추출합니다. (/partners/applicant_management/ 이후의 숫자 부분)
      const idMatch = hrefValue.match(
        /\/partners\/applicant_management\/(\d+)/,
      );

      if (idMatch && idMatch[1]) {
        postIds.push(idMatch[1]);
      }
    }
  }
  console.log("===========> ~ postId:", postIds);
  console.log("채용공고 가져오기 완료");

  return postIds;
}

/**채용공고의 미열람 지원자들의 Id만 가져오기*/
async function getUserCardsId(page, postId) {
  let applicantId = [];

  await page.goto(
    `https://b2b.jobplanet.co.kr/partners/applicant_management/${postId}?status=opened`,
  );
  await page.waitForTimeout(1500);
  const isEmptyListExist =
    (await page.$(".applicant_manage__list .empty_list")) !== null;

  if (isEmptyListExist) {
    console.log(
      `${postId}<=이 공고는 미열람 지원자 없어서 Skip 하고 다음 postId로 넘어갑니다`,
    );
    return [];
  }

  await page.waitForSelector(
    ".default.user > .default_title > button.title_name",
  );

  // 모든 지원자의 이름이 포함된 버튼 요소를 선택합니다.
  const elements = await page.$$(
    ".default.user > .default_title > button.title_name",
  );

  for (let element of elements) {
    // id 속성 값을 가져옵니다.
    const idValue = await page.evaluate((el) => el.id, element);
    // const idValue = await element.getProperty('id');

    // 'list_user_' 이후의 부분을 추출하여 배열에 추가합니다.
    const idMatch = idValue.match(/list_user_(\d+)/);

    if (idMatch && idMatch[1]) {
      applicantId.push(idMatch[1]);
    }
  }

  return applicantId;
}

// 이력서를 따로 올려서 지원자리스트에서 바로 다운로드이력서를 받아오는 경우
async function downloadResumes(page) {
  let downloadUrls = [];
  let previewUrls = [];
  let fileNames = [];

  try {
    const fileButtons = await page.$$(".attachment_file");

    if (fileButtons.length === 0) throw new Error("No attachment files found.");

    for (let button of fileButtons) {
      // 파일 이름 추출 (버튼 텍스트)
      const fileName = await page.evaluate(
        (button) => button.textContent,
        button,
      );
      fileNames.push(fileName);

      // id 속성에서 다운로드 및 미리보기 URL 추정
      const fileId = await page.evaluate(
        (button) => button.id.replace("attachment_file_", ""),
        button,
      );

      // 파일 다운로드
      await button.click();

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.click('button:has-text("다운로드")'),
      ]);

      const path = `${fileName}`;
      await download.saveAs(path);

      // 저장된 파일의 경로를 이용하여 URL 생성
      const [downloadUrl, previewUrl] = await Promise.all([
        uploadFileDownload(path),
        uploadFilePreview(path),
      ]);

      downloadUrls.push(downloadUrl);
      previewUrls.push(previewUrl);

      try {
        fs.unlinkSync(path);
      } catch (error) {
        console.log(error);
      }
    }

    return [downloadUrls, previewUrls, fileNames];
  } catch (error) {
    console.error(error.message);
    return null;
  }
}


//axios 전송
export async function downloadPdf(url: string, outputPath: string){
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    console.log("===========> ~ response:", response)
    fs.writeFileSync(outputPath, response.data);
  } catch (error) {
    throw new HttpException(
      "Failed to download PDF",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

// 이력서를 따로 올려서 지원자리스트에서 바로 다운로드이력서를 받아오는 경우
async function downloadResumes_first(page) {
  let downloadUrls = [];
  let previewUrls = [];
  let fileNames = [];

  try {
    // Find all PDF links on the page
    const pdfLinksAndNames = await page.$$eval("a", (links) =>
      links.map((link, index) => ({
        href: link.href,
        fileName: link.textContent,
        index,
      })),
    );

    const filteredPdfLinksAndNames = pdfLinksAndNames.filter(({ href }) =>
      href.startsWith("https://www.jobplanet.co.kr"),
    );

    console.log(
      "===========> ~ filteredPdfLinksAndNames:",
      filteredPdfLinksAndNames,
    );

    for (let { href: pdfLink, fileName, index } of filteredPdfLinksAndNames) {
      console.log("===========> ~ fileName:", fileName);
      console.log("===========> ~ pdfLink:", pdfLink);
      // Click the link to trigger download
      await page.click(`a:nth-of-type(${index + 1})`);
      
      // Wait for the download event
      const download = await page.waitForEvent("download");
      
      fileNames.push(fileName);
      
      const path = `${fileName}`;
      downloadPdf(pdfLink, path)
      await download.saveAs(path);

      // 저장된 파일의 경로를 이용하여 URL 생성
      const [downloadUrl, previewUrl] = await Promise.all([
        uploadFileDownload(path),
        uploadFilePreview(path),
      ]);

      downloadUrls.push(downloadUrl);
      previewUrls.push(previewUrl);

      try {
        fs.unlinkSync(path);
        continue;
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    // 공고명 및 이름 추출 (이 부분은 실제 페이지의 구조에 따라 수정해야 합니다)
    const noticeName = await page.$eval(
      ".resume_preview__subject",
      (el) => el.textContent,
    );
    const userName = await page.$eval(
      ".resume_applicant__name",
      (el) => el.textContent,
    );

    // 'PDF로 저장' 버튼 클릭
    const saveButton = await page.waitForSelector(
      'button:has-text("PDF로 저장")',
    );

    if (saveButton) {
      await saveButton.click();

      // 파일 다운로드 이벤트 대기
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        saveButton.click(),
      ]);

      const fileName = await download.suggestedFilename();
      fileNames.push(fileName);

      const path = `${fileName}`;
      await download.saveAs(path);

      // 저장된 파일의 경로를 이용하여 URL 생성
      const [downloadUrl, previewUrl] = await Promise.all([
        uploadFileDownload(path),
        uploadFilePreview(path),
      ]);

      downloadUrls.push(downloadUrl);
      previewUrls.push(previewUrl);

      try {
        fs.unlinkSync(path);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.error(error.message);
  }

  return [downloadUrls, previewUrls, fileNames];
}

//지원자 이력서 다운로드 및 정보 가져오기
async function saveUserResume(page, postId) {
  const applicantIds = await getUserCardsId(page, postId);
  console.log("===========> ~ applicantIds:", applicantIds);
  let allApplicantInfo = [];

  for (let applicantId of applicantIds) {
    console.log("===========> ~ applicantId:", applicantId);
    const url = `https://www.jobplanet.co.kr/cv/resumes?type=applicant&applicant_id=${applicantId}`;
    await page.goto(url);
    await page.waitForTimeout(2000);
    const existResume = await page.$(".resume_preview");
    const url1 = page.url();
    if (!existResume) {
      console.log(`해당지원자(${applicantId})는 페이지가 없습니다.`);
      await page.goBack();
      continue;
    }
    let applicantInfo = await crawlingApplicant_first(page);
    allApplicantInfo.push(applicantInfo);
  }
  console.log("===========> ~ allUserInfo:", allApplicantInfo);
  return allApplicantInfo;
}

// ①에 해당하는 지원자 한명씩 정보 가져오기
async function crawlingApplicant_first(page) {
  let applicantInfo = {};
  // 이름 가져오기
  const nameSelector = ".resume_applicant__name";
  const name = await page.textContent(nameSelector);

  // 공고명 가져오기
  const positionSelector = ".resume_preview__subject";
  const positionName = await page.textContent(positionSelector);
  const position = positionName.split("_")[0].trim();

  // 지원일 가져오기
  const applicationDateSelector = ".resume_preview__subject";
  const fullText = await page.textContent(applicationDateSelector);

  // "지원일 YYYY.MM.DD" 형식에서 날짜 부분만 추출합니다.
  const applicationDateMatch = fullText.match(/지원일 (\d{4}\.\d{2}\.\d{2})/);

  let applicationDate;
  if (applicationDateMatch && applicationDateMatch[1]) {
    // "YYYY.MM.DD" 형식을 "YYYY-MM-DD" 형식으로 변환합니다.
    applicationDate = applicationDateMatch[1].replace(/\./g, "-");
  } else {
    console.log("지원일 오류 발생");
  }

  // 이메일 가져오기
  const emailSelector = ".resume_applicant__contact p:nth-child(2)";
  const email = await page.textContent(emailSelector);

  // 핸드폰 번호 가져오기
  const phoneSelector = ".resume_applicant__contact p:nth-child(1)";
  const phone = await page.textContent(phoneSelector);

  applicantInfo["email"] = email;
  applicantInfo["mobile"] = phone;
  applicantInfo["position"] = position;
  applicantInfo["name"] = name;
  applicantInfo["chk_time"] = applicationDate;
  const [downloadUrls, previewUrls, fileNames] = await downloadResumes_first(
    page,
  );
  applicantInfo["filePath"] = downloadUrls;
  applicantInfo["previewPath"] = previewUrls;
  applicantInfo["file_name"] = fileNames;
  return applicantInfo;
}

// ②에 해당하는 지원자 한명씩 정보 가져오기
async function crawlingApplicant_second(page) {
  let applicantInfo = {};

  // 이름 가져오기
  const nameSelector = ".default.user .title_name";
  const fullText = await page.textContent(nameSelector);
  const name = fullText.split("(")[0].trim();

  applicantInfo["name"] = name;

  // 지원일 가져오기
  let applicationDate;
  const applicationDateSelector = ".default.user .default_text";
  const applicationDateString = await page.textContent(applicationDateSelector);
  // "지원일: YYYY. MM. DD HH:MM" 형식의 문자열에서 날짜 부분만 추출합니다.
  const applicationDateMatch = applicationDateString.match(
    /지원일: (\d{4}. \d{2}. \d{2} \d{2}:\d{2})/,
  );
  if (applicationDateMatch && applicationDateMatch[1]) {
    const originalFormat =
      applicationDateMatch[1].replace(/\. /g, "-").replace(" ", "T") + ":00Z";
    // Date 객체를 생성하고 ISO 문자열로 변환합니다.
    const dateObject = new Date(originalFormat);
    const isoString = dateObject.toISOString();
    // "YYYY-MM-DDTHH:MM:SS.sssZ" 형식에서 날짜 부분만 추출합니다.
    applicationDate = isoString.split("T")[0];
    applicantInfo["chk_time"] = applicationDate;
  } else {
    console.log("지원일 오류 발생");
  }

  // 첨부파일 다운로드하기
  const [downloadUrls, previewUrls, fileNames] = await downloadResumes(page);
  applicantInfo["filePath"] = downloadUrls;
  applicantInfo["previewPath"] = previewUrls;
  applicantInfo["file_name"] = fileNames;
  console.log("===========> ~ 세컨드 applicantInfo:", applicantInfo);
  return applicantInfo;
}

export async function CrawlingJobplanet(ID, PW) {
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
  await page.waitForTimeout(2000);
  await navigateJobPostings(page);
  await page.waitForTimeout(2000);

  const applyPostIds = await getJobPostings(page);
  let allApplicantInfo = [];
  await page.waitForTimeout(2000);
  for (let postId of applyPostIds) {
    console.log("현재공고==>:", postId);
    const applicantInfo = await saveUserResume(page, postId);
    console.log(`${postId}공고의 지원자 정보==> ${applicantInfo}`);
    if (applicantInfo.length === 0) continue;
    allApplicantInfo = allApplicantInfo.concat(applicantInfo);
  }
  await page.waitForTimeout(2000);
  await browser.close();
  return allApplicantInfo;
}
