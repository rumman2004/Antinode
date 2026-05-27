import dotenv from 'dotenv';
dotenv.config({ override: true });
import { uploadToS3 } from './src/utils/s3Upload.js';
import { uploadToCloudinary } from './src/utils/cloudinaryUpload.js';

async function test() {
  try {
    const s3Res = await uploadToS3(Buffer.from('hello s3'), 'test.txt', 'text/plain');
    console.log('S3 Success:', s3Res);
  } catch (e) {
    console.error('S3 Error:', e);
  }

  try {
    const cloudRes = await uploadToCloudinary(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'), 'test.png');
    console.log('Cloudinary Success:', cloudRes);
  } catch (e) {
    console.error('Cloudinary Error:', e);
  }
}
test();
