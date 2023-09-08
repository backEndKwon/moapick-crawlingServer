import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import { config } from 'dotenv';

config();

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: 'ap-northeast-2',
  signatureVersion: 'v4',
});

export const uploadFileDownload = (fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(`${fileName}`);
    // 파일 설정
    const params = {
      Bucket: 'moapick',
      Key: `download_${fileName}`,
      Body: fileContent,
      ContentType: 'application/pdf',
      ContentDisposition: 'attachment',
    };
    // 파일 업로드
    s3.upload(
      params,
      function (err: unknown, data: AWS.S3.ManagedUpload.SendData) {
        if (err) {
          reject(err);
        }
        console.log(data);
        const url = encodeURI(params.Key);
        const downloadUrl = `https://d1elz4g2bnstoc.cloudfront.net/${url}`;
        resolve(downloadUrl);
      },
    );
  });
};

export const uploadFilePreview = (fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(fileName);

    // 파일 설정
    const params = {
      Bucket: 'moapick',
      Key: `preview_${fileName}`,
      Body: fileContent,
      ContentType: 'application/pdf',
      ContentDisposition: 'inline',
    };

    // 파일 업로드
    s3.upload(
      params,
      function (err: unknown, data: AWS.S3.ManagedUpload.SendData) {
        if (err) {
          reject(err);
        }
        console.log(data);
        const url = encodeURI(params.Key);
        const downloadUrl = `https://d1elz4g2bnstoc.cloudfront.net/${url}`;
        resolve(downloadUrl);
      },
    );
  });
};
