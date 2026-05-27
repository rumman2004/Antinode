import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.js";
import crypto from "crypto";
import path from "path";

interface S3UploadResult {
  key: string;
  url: string;
}

/**
 * Uploads a file buffer to AWS S3.
 * Generates a unique key using a random UUID prefix to avoid collisions.
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<S3UploadResult> => {
  const bucket = process.env.AWS_S3_BUCKET_NAME as string;
  const ext = path.extname(originalName);
  const key = `uploads/${crypto.randomUUID()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { key, url };
};

/**
 * Deletes a file from AWS S3 using its key.
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  const bucket = process.env.AWS_S3_BUCKET_NAME as string;
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await s3Client.send(command);
};

/**
 * Generates a temporary presigned URL for downloading a file from S3.
 * URL expires after 1 hour (3600 seconds).
 */
export const getPresignedDownloadUrl = async (key: string): Promise<string> => {
  const bucket = process.env.AWS_S3_BUCKET_NAME as string;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
