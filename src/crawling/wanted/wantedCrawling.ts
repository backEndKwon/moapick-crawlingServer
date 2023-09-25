import { Page, chromium } from "playwright";
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
    await page.goto(
      "https://id.wanted.jobs/login?before_url=https%3A%2F%2Fwww.wanted.co.kr%2Fdashboard%2Fuser%2Fcheck&redirect_url=https%3A%2F%2Fwww.wanted.co.kr%2Fapi%2Fchaos%2Fauths%2Fv1%2Fcallback%2Fset-token&client_id=3cxYxwiZG2Hys8DvQjwJzxMm&service=dashboard&amp_device_id=undefined",
    );

    await (await page.waitForSelector(buttonSelector.emailInput)).type(ID);
    await (await page.waitForSelector(buttonSelector.submitButton)).click();

    await (await page.waitForSelector(buttonSelector.passwordInput)).type(PW);
    await (await page.waitForSelector(buttonSelector.submitButton)).click();
    console.log("로그인 성공");

    await page.waitForNavigation();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

//채용중인 공고페이지로 이동
async function navigateJobPostings(page) {
  await page.goto(
    "https://www.wanted.co.kr/dashboard/recruitment?order=id&status=active",
  );
}

/**채용공고 가져오기*/
async function getJobPostings(page) {
  console.log("채용공고 가져오는 중");
  await page.waitForSelector(
    "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']",
  );
  const elements = await page.$$(
    "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']",
  );

  let applyPostId = [];
  for (let element of elements) {
    const text = await element.$eval(
      "span.gtNgFZ span",
      (node) => node.innerText,
    );
    if (parseInt(text, 10) > 0) {
      const href = await element.evaluate((node) =>
        node.getAttribute("data-position-id"),
      );
      applyPostId.push(href);
    }
  }
  console.log("채용공고 가져오기 완료");
  return applyPostId;
}

/**지원자카드 Id 가져오기*/
async function getUserCardsId(page, postId) {
  const applyUserInfo = await page.evaluate(
    (postId) => {
      const baseUrl = location.href.substring(
        0,
        location.href.indexOf(".kr") + 3,
      );

      const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1?column_index=send&position_id=${postId}&is_reject=false`;
      return fetch(newUrl)
        .then((res) => res.json())
        .then((data) => data.data);
    },
    [postId],
  );
  console.log("===========> ~ applyUserInfo:", applyUserInfo);

  const userCardsId = applyUserInfo
    .filter((user) => user.cancel_time === null)
    .filter((user) => user.matchup_column_index === null)
    .map((user) => user.id);
  console.log("===========> ~ userCardsId:", userCardsId);
  return userCardsId;
}
async function downloadResumes(page: Page, resumes) {
  let downloadUrls = [];
  let previewUrls = [];
  let fileNames = [];

  for (let resume of resumes.data) {
    const { file_name } = resume;
    try {
      await (
        await page.waitForSelector(`span:has-text('${file_name}')`)
      ).click();
    } catch (error) {
      console.log(error);
      continue;
    }

    try {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.click('button:has-text("다운로드")'),
      ]);

      const fileName = await download.suggestedFilename();
      fileNames.push(fileName);
      const path = `${fileName}`;
      await download.saveAs(path);

      const [downloadUrl, previewUrl] = await Promise.all([
        uploadFileDownload(path),
        uploadFilePreview(path),
      ]);

      downloadUrls.push(downloadUrl);
      previewUrls.push(previewUrl);
      fs.unlinkSync(path);
    } catch (error) {
      console.log(error);
      continue;
    }
  }
  return [downloadUrls, previewUrls, fileNames];
}
//지원자 이력서 다운로드 및 정보 가져오기
async function saveUserResume(page, postId) {
  const url = `https://www.wanted.co.kr/dashboard/recruitment/${postId}?application=is_exclude_reject`;
  await page.goto(url);

  // Get user cards
  const userCardsIds = await getUserCardsId(page, postId);

  let allUserInfo = [];
  for (let userCardId of userCardsIds) {
    const url = `https://www.wanted.co.kr/dashboard/recruitment/${postId}?application=is_exclude_reject&application_detail=${userCardId}`;
    await page.goto(url);

    let userInfo = {};
    //user데이터
    const data = await page.evaluate(async (userCardId) => {
      const baseUrl = location.href.substring(
        0,
        location.href.indexOf(".kr") + 3,
      );

      const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1/${userCardId}`;
      const res = await fetch(newUrl);
      const data = await res.json();
      return data;
    }, userCardId);
    //이력서 이름
    const resumes = await page.evaluate(async (userCardId) => {
      const baseUrl = location.href.substring(
        0,
        location.href.indexOf(".kr") + 3,
      );

      const newUrl = `${baseUrl}/api/dashboard/chaos/resumes/v1/apply/${userCardId}`;
      const res = await fetch(newUrl);
      const data = await res.json();
      return data;
    }, userCardId);

    console.log("🚀 ~ file: wantedCrawling.js:141 ~ resume ~ resume:", resumes);

    const { name, email, mobile } = data.data.user;
    userInfo["name"] = name;
    userInfo["email"] = email;
    userInfo["mobile"] = mobile;
    userInfo["position"] = data.data.job.position;
    userInfo["chk_time"] = data.data.chk_time;

    const [downloadUrls, previewUrls, fileNames] = await downloadResumes(
      page,
      resumes,
    );

    userInfo["file_name"] = fileNames;
    userInfo["filePath"] = downloadUrls;
    userInfo["previewPath"] = previewUrls;
    allUserInfo.push(userInfo);
  }

  return allUserInfo;
}

export async function wantedCrawling(ID, PW) {
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

  await navigateJobPostings(page);

  const applyPostIds = await getJobPostings(page);

  let allUserInfo = [];

  for (let postId of applyPostIds) {
    const userInfoByJobPosting = await saveUserResume(page, postId);

    allUserInfo.push(userInfoByJobPosting);
  }
  console.log(allUserInfo);
  await browser.close();
  return allUserInfo;
}
