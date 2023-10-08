import { chromium } from "playwright";
import { config } from "dotenv";
import { uploadFileDownload, uploadFilePreview } from "../../lib/aws";
import * as fs from "fs";
import axios from "axios";
import { HttpException, HttpStatus } from "@nestjs/common";
import { commonSetting } from "../common";
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
    "https://b2b.jobplanet.co.kr/partners/job_management?status=opened",
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

/**채용공고의 열람, 미열람 지원자들의 Id 가져오기*/
async function getUserCardsId(page, postId) {
  let applicantId = [];
  const statuses = ["opened", "not_opened"];
  // const statuses = ["opened"];

  for (const status of statuses) {
    await page.goto(
      `https://b2b.jobplanet.co.kr/partners/applicant_management/${postId}?status=${status}`,
    );
    await page.waitForTimeout(3000);
    const isEmptyListExist =
      (await page.$(".applicant_manage__list .empty_list")) !== null;

    if (isEmptyListExist) {
      console.log(
        `${status}상태의 ${postId}<=이 공고는 미열람 지원자 없어서 Skip 하고 다음 postId로 넘어갑니다`,
      );
      continue;
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
  }
  console.log("getUserCardsId함수에 있는 지원자ID", applicantId);
  return applicantId;
}

/*② 제목링크없는 경우-1가지(이력서만있음) */
async function downloadResumes_second(page, applicantId) {
  let downloadUrls = [];
  let previewUrls = [];
  let fileNames = [];
  console.log("이력서 따로 올린 지원자 리스트에서 다운로드 시작");
  const userIdElement = await page.$(`button[id="list_user_${applicantId}"]`);

  if (!userIdElement) {
    throw new Error("Applicant not found");
  }

  try {
    // 특정 applicantId에 해당하는 첨부파일 버튼만 선택
    const fileButtons = await page.$$(
      `div.list_item:has(#list_user_${applicantId}) .attachment_file`,
    );

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

//미리보기 pdf는 axios 전송
export async function downloadPdf(url: string, outputPath: string) {
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
}

/*① 제목링크있는 경우-2가지(링크만, 링크+이력서) */
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

    for (let { href: pdfLink, fileName, index } of filteredPdfLinksAndNames) {
      console.log("===========> ~ fileName:", fileName);
      console.log("===========> ~ pdfLink:", pdfLink);
      // Click the link to trigger download
      // await page.click(`a:nth-of-type(${index + 1})`);

      // Wait for the download event
      // const download = await page.waitForEvent("download");
      // console.log("===========> ~ download:", download)

      fileNames.push(fileName);

      const path = `${fileName}`;
      const urlResponse = await downloadPdf(pdfLink, path);
      // await download.saveAs(path);

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
async function saveUserResume(page, postId, status) {
  let allApplicantInfo = [];

  const applicantIds = await getUserCardsId(page, postId);
  // const statuses = ["opened", "not_opened"];
  // for (const status of statuses) {
  const goUrl = `https://b2b.jobplanet.co.kr/partners/applicant_management/${postId}?status=${status}`;
  await page.goto(goUrl);
  await page.waitForTimeout(2000);
  for (let applicantId of applicantIds) {
    let applicantInfo;
    //모달 제거
    const modalElement = await page.$(".jf_modal__wrap.jf_shadow2");
    if (modalElement) {
      const closeButton = await page.$(".jf_modal__close");
      if (closeButton) {
        await closeButton.click();
        console.log("Modal was present and has been closed.");
      }
    }
    // 지원자의 id를 가져옵니다.
    const userIdElement = await page.$(`button[id="list_user_${applicantId}"]`);
    console.log(
      `크롤링  상황 ==> 공고아이디:${postId}, 유저상태:${userIdElement}, 상태:${status}, 지원자:${applicantId}`,
    );

    if (userIdElement) {
      try {
        const url = `https://www.jobplanet.co.kr/cv/resumes?type=applicant&applicant_id=${applicantId}`;
        await page.goto(url);
        await page.waitForTimeout(2000);

        // resume_preview 요소가 있는지 확인합니다.
        const resumePreviewElement = await page.$(".resume_preview");

        if (resumePreviewElement) {
          console.log(`지원자: ${applicantId} 첫번째 기능으로 크롤링`);
          /*① 제목링크있는 경우-2가지(링크만, 링크+이력서) */
          applicantInfo = await crawlingApplicant_first(page);
          allApplicantInfo.push(applicantInfo);
          // 해당 로직이 끝나면 페이지 뒤로 가기
          await page.goBack();
        } else {
          await page.waitForTimeout(2000);
          await page.goBack();
          // 해당 applicanId에 맞는 인원을 찾아서 crawlingApplicant_second 함수 실행
          console.log(`지원자: ${applicantId} 두번째 기능으로 크롤링`);
          /*② 제목링크없는 경우-1가지(이력서만있음) */
          applicantInfo = await crawlingApplicant_second(
            page,
            applicantId,
            postId,
            status,
          );
          allApplicantInfo.push(applicantInfo);
        }
      } catch (error) {
        console.error(`Error while fetching details: ${error.message}`);
      }
    }
  }
  console.log("===========> ~ allUserInfo:", allApplicantInfo);
  return allApplicantInfo;
  // }
}

// ①에 해당하는 지원자 한명씩 정보 가져오기
async function crawlingApplicant_first(page) {
  let applicantInfo = {};
  const url = page.url();
  console.log(`첫번쨰 크롤링의 url : ${url}`);
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
async function crawlingApplicant_second(page, applicantId, postId, status) {
  console.log("===========> crawlingApplicant_second:", applicantId);
  let applicantInfo = {};
  const url = `https://b2b.jobplanet.co.kr/partners/applicant_management/${postId}?status=${status}`;
  await page.goto(url);
  await page.waitForTimeout(2000);
  //모달 제거
  const modalElement = await page.$(".jf_modal__wrap.jf_shadow2");
  if (modalElement) {
    const closeButton = await page.$(".jf_modal__close");
    if (closeButton) {
      await closeButton.click();
      console.log("Modal was present and has been closed.");
    }
  }
  const userIdElement = await page.$(`#list_user_${applicantId}`);

  const dateElement = await page.$(`div.default.user > span.default_text`);
  const dateText = await dateElement.textContent();
  const regex = /(\d{4})\. (\d{2})\. (\d{2}) (\d{2}):(\d{2})/;
  const match = dateText.match(regex);
  const year = match[1];
  const month = match[2];
  const day = match[3];

  const positionElement = await page.$(".title_txt");
  const positionText = positionElement
    ? await positionElement.textContent()
    : "";
  applicantInfo["position"] = positionText;

  // YYYY-MM-DD 형식으로 변환
  const dateStr = `${year}-${month}-${day}`;
  console.log("===========> ~ dateStr:", dateStr);
  if (!userIdElement) {
    throw new Error("Applicant not found");
  }
  const nameElement = await userIdElement.textContent();
  const name = nameElement.split("(")[0].trim();

  applicantInfo["name"] = name;
  applicantInfo["chk_time"] = dateStr;

  // 첨부파일 다운로드하기

  const [downloadUrls, previewUrls, fileNames] = await downloadResumes_second(
    page,
    applicantId,
  );
  console.log("===========> ~ [downloadUrls, previewUrls, fileNames]:", [
    downloadUrls,
    previewUrls,
    fileNames,
  ]);
  applicantInfo["filePath"] = downloadUrls;
  applicantInfo["previewPath"] = previewUrls;
  applicantInfo["file_name"] = fileNames;

  console.log("===========> ~ 세컨드 applicantInfo:", applicantInfo);
  return applicantInfo;
}

// async function waitForSelectorInElement(page, parentElementHandle, selector) {
//   while (true) {
//     const element = await parentElementHandle.$(selector);
//     if (element !== null) return element;
//     else await page.waitForTimeout(500); // wait for half a second before trying again
//   }
// }

export async function CrawlingJobplanet(ID, PW) {
  const browser = await chromium.launch({
    headless: commonSetting,
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
  await navigateJobPostings(page); // 오픈된 채용공고
  await page.waitForTimeout(2000);

  const applyPostIds = await getJobPostings(page); // 오픈된 채용공고 아이디

  let allApplicantInfo = [];
  await page.waitForTimeout(2000);
  const statuses = ["opened", "not_opened"];
  for (const status of statuses) {
    for (let postId of applyPostIds) {
      const applicantInfo = await saveUserResume(page, postId, status);
      if (applicantInfo.length === 0) continue;
      allApplicantInfo = allApplicantInfo.concat(applicantInfo);
    }
  }
  await page.waitForTimeout(2000);
  await browser.close();
  return allApplicantInfo;
}
