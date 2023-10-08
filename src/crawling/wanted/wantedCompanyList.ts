import { chromium } from 'playwright';
import * as fs from 'fs';
import * as xlsx from 'xlsx';

export async function crawlingWantedCompanyList() {
  
  try{

    const browser = await chromium.launch({
        headless: false,
      });  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://insight.wanted.co.kr/now-hiring-companies');

  const companies = await page.$$eval('a[data-attribute-id="companyHiring__company__click"]', elements => {
    return elements.map(element => {
      const companyName = element.getAttribute('data-company-name');
      const positionCount = element.querySelector('.sc-9b8eb5d-0.kzQHVj').textContent.replace(/[^0-9]/g, '');
      return { companyName, positionCount };
    });
  });

  await browser.close();

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(companies);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Companies');

  const filePath = 'C:/Users/82106/comapnies.xlsx';
  fs.writeFileSync(filePath, xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));

  console.log(`데이터를 ${filePath}에 저장했습니다.`);

  return "crawling success"
} catch(err){
    console.log(err)
    return "crawling fail"
}
}
