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

// 받은 postId로 지원자 등록하기
async function navigateJobPostings(page) {
  const postIds = ["ce156e40-586b-11ee-833a-359c8b5fa18c"];

  for (let postId of postIds) {
    await page.goto(
      `https://app.ninehire.com/7jXUqMTN/recruitment/${postId}/applicants`,
    );
    // 지원자 직접 추가 버튼이 나타날 때까지 기다립니다.
    const addButtonSelector =
      ".ApplicantStepCard__KanbanBoardButton-sc-b4fe8514-2.bcCQrX";
    await page.waitForSelector(addButtonSelector);

    // 지원자 직접 추가 버튼을 찾아 클릭합니다.
    await page.click(addButtonSelector);

    // 지원자의 정보를 가져왔다는 전제하에 진행
    const applicantInfo = {
      name: "박보일",
      email: "parkbo1@cute.com",
      phone: "01012345678",
      referer: "로켓펀치",
    };

    // 이름 입력 필드가 나타날 때까지 기다립니다.
    const nameInputSelector = 'input[placeholder="내용을 입력해 주세요."]';
    const emailInputSelector = 'input[placeholder="example@domain.com"]';
    const phoneInputSelector = 'input[placeholder="01012345678"]';
    await page.waitForSelector(nameInputSelector);
    await page.type(nameInputSelector, applicantInfo.name);
    await page.waitForSelector(emailInputSelector);
    await page.type(emailInputSelector, applicantInfo.email);
    await page.waitForSelector(phoneInputSelector);
    await page.type(phoneInputSelector, applicantInfo.phone);
    page.waitForTimeout(1500)
    const pdfUrl = "https://d1elz4g2bnstoc.cloudfront.net/preview_%EC%B5%9C%EC%97%AC%EB%9E%8C%201.pdf";

    // 해당 요소의 셀렉터를 설정합니다.
    const fileUploadButtonSelector = ".FileUploadInput__InputButton-sc-b6483d2a-1.hvaPRJ span";
    
    await page.evaluate(({selector, url}) => {
      // 해당 요소를 찾습니다.
      const element = document.querySelector(selector);
    
      if (element) {
        // strong 태그 생성
        const newElement = document.createElement('strong');
        newElement.textContent = url;
    
        // 기존 span 태그 대체
        element.parentNode.replaceChild(newElement, element);
        
        // svg 요소 수정
        const svgElement = document.querySelector('.IconButton__Container-sc-2996e775-0.ddpPXT svg');
        if(svgElement){
          svgElement.setAttribute('width', '12');
          svgElement.setAttribute('height', '12');
          svgElement.setAttribute('viewBox', '0 0 12 12');
    
          const pathElement = svgElement.querySelector('path');
          if(pathElement){
            pathElement.setAttribute("d", "M9.53033 3.53033C9.82322 3.23744 9.82322 2.76256 9.53033 2.46967C9.23743 2.17678 8.76256 2.17678 8.46967 2.46967L6 4.93934L3.53033 2.46967C3.23744 2.17678 2.76256 2.17678 2.46967 2.46967C2.17678 2.76256 2.17678 3.23744 2.46967 3.53033L4.93934 6L2.46967 8.46967C2.17678 8.76256 2.17678 9.23743 2.46967 9.53033C2.76256 9.82322 3.23744 9.82322 3.53033 9.53033L6 7.06066L8.46967 9.53033C8.76256 9.82322 9.23743 9.82322 9.53033 9.53033C9.82322 9.23743 9.82322 8.76256 9.53033 8.46967L7.06066 6L9.53033 3.53033Z");
          }
        }
        
      }
    }, {selector: fileUploadButtonSelector, url: pdfUrl});
// // 지원 경로 드롭다운 메뉴가 나타날 때까지 기다립니다.
// const refererDropdownMenu = ".Select__Container-sc-770e687d-0.dtNJsL";
// await page.waitForSelector(refererDropdownMenu, {timeout: 5000});
    
// // 일정 시간 동안 기다립니다.
// await page.waitForTimeout(1500);

// // 해당 요소를 클릭합니다.
// await page.click(refererDropdownMenu);// await page.waitForSelector(refererDropdownMenu);
// page.waitForTimeout(1500)
// // 드롭다운 메뉴를 클릭합니다.

//     // // '직접 입력' 옵션이 나타날 때까지 기다립니다.
//     const directInputOption = ".ant-dropdown-menu-item"; 
//     // await page.waitForSelector(directInputOption);

//     // // '직접 입력' 옵션을 클릭합니다.
//     await page.click(directInputOption);

    // // '직접 입력' 필드가 나타날 때까지 기다립니다.
    // const refererInputSelector = 'input[placeholder="선택해주세요."]';
    // await page.waitForSelector(refererInputSelector);

    // // 참조자 정보를 입력합니다.
    // await page.type(refererInputSelector, applicantInfo.referer);
  }
}

export async function CrawlingNinehire(ID, PW) {
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
  console.log("로그인 중");
  await login(page, ID, PW);
  console.log("로그인 완료");
  console.log("지원자 등록시작");
  await navigateJobPostings(page);
  console.log("지원자 등록완료");

  // await browser.close();
  return "등록완료";
}
// /*채용공고 가져오기*/
// async function getJobPostings(page) {
//   console.log("채용공고 가져오는 중");
//   await page.waitForSelector(
//     "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']",
//   );
//   const elements = await page.$$(
//     "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']",
//   );

//   let applyPostId = [];
//   for (let element of elements) {
//     const text = await element.$eval(
//       "span.gtNgFZ span",
//       (node) => node.innerText,
//     );
//     if (parseInt(text, 10) > 0) {
//       const href = await element.evaluate((node) =>
//         node.getAttribute("data-position-id"),
//       );
//       applyPostId.push(href);
//     }
//   }
//   console.log("채용공고 가져오기 완료");
//   return applyPostId;
// }

// /**지원자카드 Id 가져오기*/
// async function getUserCardsId(page, postId) {
//   const applyUserInfo = await page.evaluate(
//     (postId) => {
//       const baseUrl = location.href.substring(
//         0,
//         location.href.indexOf(".kr") + 3,
//       );

//       const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1?column_index=send&position_id=${postId}&is_reject=false`;
//       return fetch(newUrl)
//         .then((res) => res.json())
//         .then((data) => data.data);
//     },
//     [postId],
//   );
//   console.log("===========> ~ applyUserInfo:", applyUserInfo);

//   const userCardsId = applyUserInfo
//     .filter((user) => user.cancel_time === null)
//     .filter((user) => user.matchup_column_index === null)
//     .map((user) => user.id);
//   console.log("===========> ~ userCardsId:", userCardsId);
//   return userCardsId;
// }
// async function downloadResumes(page, resumes) {
//   let downloadUrls = [];
//   let previewUrls = [];
//   let fileNames = [];
//   for (let resume of resumes.data) {
//     const { file_name } = resume;
//     await (await page.waitForSelector(`span:has-text('${file_name}')`)).click();
//     const [download] = await Promise.all([
//       page.waitForEvent("download"),
//       page.click('button:has-text("다운로드")'),
//     ]);

//     const fileName = await download.suggestedFilename();
//     fileNames.push(fileName);
//     const path = `${fileName}`;
//     await download.saveAs(path);

//     const [downloadUrl, previewUrl] = await Promise.all([
//       uploadFileDownload(path),
//       uploadFilePreview(path),
//     ]);

//     downloadUrls.push(downloadUrl);
//     previewUrls.push(previewUrl);
//     try {
//       fs.unlinkSync(path);
//     } catch (error) {
//       console.log(error);
//     }
//   }
//   return [downloadUrls, previewUrls, fileNames];
// }
// //지원자 이력서 다운로드 및 정보 가져오기
// async function saveUserResume(page, postId) {
//   const url = `https://www.wanted.co.kr/dashboard/recruitment/${postId}?application=is_exclude_reject`;
//   await page.goto(url);

//   // Get user cards
//   const userCardsIds = await getUserCardsId(page, postId);

//   let allUserInfo = [];
//   for (let userCardId of userCardsIds) {
//     const url = `https://www.wanted.co.kr/dashboard/recruitment/${postId}?application=is_exclude_reject&application_detail=${userCardId}`;
//     await page.goto(url);

//     let userInfo = {};
//     //user데이터
//     const data = await page.evaluate(async (userCardId) => {
//       const baseUrl = location.href.substring(
//         0,
//         location.href.indexOf(".kr") + 3,
//       );

//       const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1/${userCardId}`;
//       const res = await fetch(newUrl);
//       const data = await res.json();
//       return data;
//     }, userCardId);
//     //이력서 이름
//     const resumes = await page.evaluate(async (userCardId) => {
//       const baseUrl = location.href.substring(
//         0,
//         location.href.indexOf(".kr") + 3,
//       );

//       const newUrl = `${baseUrl}/api/dashboard/chaos/resumes/v1/apply/${userCardId}`;
//       const res = await fetch(newUrl);
//       const data = await res.json();
//       return data;
//     }, userCardId);

//     console.log("🚀 ~ file: wantedCrawling.js:141 ~ resume ~ resume:", resumes);

//     const { name, email, mobile } = data.data.user;
//     userInfo["name"] = name;
//     userInfo["email"] = email;
//     userInfo["mobile"] = mobile;
//     userInfo["position"] = data.data.job.position;
//     userInfo["chk_time"] = data.data.chk_time;

//     const [downloadUrls, previewUrls, fileNames] = await downloadResumes(
//       page,
//       resumes,
//     );

//     userInfo["file_name"] = fileNames;
//     userInfo["filePath"] = downloadUrls;
//     userInfo["previewPath"] = previewUrls;
//     allUserInfo.push(userInfo);
//   }

//   return allUserInfo;
// }
