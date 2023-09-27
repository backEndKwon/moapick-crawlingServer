import { chromium } from "playwright";
import { config } from "dotenv";
import { uploadFileDownload, uploadFilePreview } from "../../lib/aws";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
config();

const buttonSelector = {
  emailInput: "input[name='email']",
  passwordInput: "input[name='password']",
  submitButton: 'button[type="submit"]',
};

const rocketPunchLoginUrl = "https://www.rocketpunch.com/login";
//로그인
export async function login(page, ID: string, PW: string) {
  try {
    await page.goto(`${rocketPunchLoginUrl}`);

    await (await page.waitForSelector(buttonSelector.emailInput)).type(ID);

    // 비밀번호 입력
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

//채용중인 공고페이지로 이동(게재 중인 채용 정보)
async function navigateJobPostings(page) {
  console.log("navigateJobPostings 진행중");
  await page.goto(
    "https://www.rocketpunch.com/companies/spartacodingclub/jobs/manage",
  );
}

/**채용공고 가져오기*/
async function getJobPostings(page) {
  const elements = await page.$$(".ui.small.basic.button"); // 해당 클래스를 가진 모든 요소 선택

  let applyPostIds = new Set(); //중복제거

  for (let element of elements) {
    let href = await element.evaluate((el) => el.getAttribute("href")); // 각 요소에서 href 속성 값 가져오기

    if (href && href.includes("/jobs/")) {
      // '/jobs/'가 포함된 경우만 처리
      let id = href.split("/")[2]; // '/jobs/' 기준으로 문자열 분리 후 두 번째 부분 선택
      applyPostIds.add(id); // 배열에 추가
    }
  }
  return [...applyPostIds];
}

async function getUserCardsIdForAllPosts(page, postIds) {
  let allUserCardIds = new Set(); //중복제거

  for (let postId of postIds) {
    console.log("getUserCardsId 진행중");

    await page.goto(`https://www.rocketpunch.com/jobs/${postId}/applications`);

    const elements = await page.$$(".apply.member.item"); // 해당 클래스를 가진 모든 요소 선택

    // let userCardIds = []; // 배열 초기화

    for (let element of elements) {
      let statusElement = await element.$(".status-text"); // 상태 텍스트 요소 가져오기
      if (statusElement) {
        // 상태 텍스트 요소가 존재하는 경우만 처리
        let statusText = await statusElement.evaluate((el) =>
          el.textContent.trim(),
        );

        if (statusText === "서류 접수") {
          let href = await element.evaluate((el) =>
            el.querySelector("a").getAttribute("href"),
          ); // 링크 주소 가져오기

          let id = href.split("/applications/")[1]; // '/applications/' 기준으로 문자열 분리 후 두 번째 부분 선택

          allUserCardIds.add(id); // 배열에 추가
        }
      }
    }
  }
  return [...allUserCardIds];
}
/**지원자카드 Id 가져오기*/
// async function getUserCardsId(page, postId) {
//   console.log('getUserCardsId 진행중');

//   await page.goto(`https://www.rocketpunch.com/jobs/${postId}/applications`);

//   const elements = await page.$$('.apply.member.item'); // 해당 클래스를 가진 모든 요소 선택

//   let userCardIds = []; // 배열 초기화

//   for (let element of elements) {
//     let statusElement = await element.$('.status-text'); // 상태 텍스트 요소 가져오기
//     if (statusElement) {
//       // 상태 텍스트 요소가 존재하는 경우만 처리
//       let statusText = await statusElement.evaluate((el) =>
//         el.textContent.trim(),
//       );

//       if (statusText === '서류 접수') {
//         let href = await element.evaluate((el) =>
//           el.querySelector('a').getAttribute('href'),
//         ); // 링크 주소 가져오기

//         let id = href.split('/applications/')[1]; // '/applications/' 기준으로 문자열 분리 후 두 번째 부분 선택

//         userCardIds.push(id); // 배열에 추가
//       }
//     }
//   }

//   return userCardIds;
// }

async function saveApplicantResumesAndReturnResult(page, userCardIds) {
  let fileNames = [];
  let allUserInfo = [];
  let homeDirectory = os.homedir();

  for (const userCardId of userCardIds) {
    const url = `https://www.rocketpunch.com/applications/${userCardId}`;
    await page.goto(url);
    let userInfo = {};

    // 사용자 이메일 추출
    const emailSelector =
      ".resume-user-content .user-info.item span:first-child";
    const email = await page.$eval(
      emailSelector,
      (element) => element.textContent,
    );

    //사용자 이름 추출
    const nameSelector = ".resume-user-header .title a";
    const name = await page.$eval(nameSelector, (element) =>
      element.textContent.trim(),
    );

    // 사용자 휴대폰번호 추출
    const phoneSelector = '.resume-user-content a[href^="tel:"]';
    const phone = await page.$eval(phoneSelector, (element) =>
      element.textContent.trim(),
    );
    fileNames.push(email);

    // 사용자 지원 포지션 추출
    const positionSelector = `.breadcrumb .section:last-child`;
    const position = await page.$eval(positionSelector, (element) =>
      element.textContent.trim(),
    );

    // 지원일 추출
    const applyDateSelector = ".content .item:nth-child(1) .content"; // 지원일 요소 선택
    const applyDate = await page.$eval(applyDateSelector, (element) =>
      element.textContent.trim(),
    );
    fileNames.push(email);

    // PDF 파일 이름 및 경로 설정
    const pdfPath = path.join(homeDirectory, `${email}.pdf`);

    console.log("===========> ~ pdfPath:", pdfPath);
    await page.pdf({ path: pdfPath, format: "A4" });
    // 업로드 함수 호출 (uploadFileDownload과 uploadFilePreview는 파일을 웹에 업로드하는 함수라 가정)
    const [downloadUrl, previewUrl] = await Promise.all([
      uploadFileDownload(pdfPath),
      uploadFilePreview(pdfPath),
    ]);

    userInfo["name"] = name;
    userInfo["email"] = email;
    userInfo["mobile"] = phone;
    userInfo["filePath"] = [downloadUrl];
    userInfo["previewPath"] = [previewUrl];
    userInfo["position"] = position;
    userInfo["chk_time"] = applyDate.split(" ")[0];
    userInfo["file_name"] = [`로켓펀치_${name}_${email}`];
    allUserInfo.push(userInfo);

    try {
      fs.unlinkSync(pdfPath);
    } catch (error) {
      console.log(error);
    }
  }

  //   return [downloadUrls, previewUrls, fileNames];
  return allUserInfo;
}

//result
export async function CrawlingRocketPunch(ID, PW) {
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

  //채용공고 가져오기
  const applyPostIds = await getJobPostings(page);
  console.log("===========> ~ applyPostIds:", applyPostIds);

  //userId 가져오기
  const userCardsIds = await getUserCardsIdForAllPosts(page, applyPostIds);
  console.log("===========> ~ userCardsIds:", userCardsIds);

  const result = await saveApplicantResumesAndReturnResult(page, userCardsIds);
  console.log("===========> ~ result:", result);

  // allUserInfo.push(userInfoByJobPosting);
  //   }
  //   console.log(allUserInfo);
  await browser.close();
  return result;
}
