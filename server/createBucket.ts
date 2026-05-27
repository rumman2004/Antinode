import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";
import "./src/env.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

async function setupBucket() {
  const bucketName = `antigravity-uploads-${crypto.randomBytes(4).toString("hex")}`;
  
  try {
    console.log(`Creating bucket: ${bucketName}...`);
    const command = new CreateBucketCommand({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: process.env.AWS_REGION as any,
      },
    });
    
    await s3Client.send(command);
    console.log(`Bucket ${bucketName} created successfully.`);

    // Update .env file
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      envContent = envContent.replace(
        /AWS_S3_BUCKET_NAME=.*/g,
        `AWS_S3_BUCKET_NAME=${bucketName}`
      );
      fs.writeFileSync(envPath, envContent);
      console.log(".env file updated successfully.");
    }
  } catch (error) {
    console.error("Failed to create bucket:", error);
  }
}

setupBucket();
