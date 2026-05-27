import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";
import path from "path";
import { Readable } from "stream";

interface CloudinaryUploadResult {
  key: string;
  url: string;
}

/**
 * Uploads a file buffer to Cloudinary using a stream.
 * Best suited for images and media files.
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  originalName: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const baseName = path.basename(originalName, path.extname(originalName));
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_") || "upload";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "antigravity",
        public_id: `${crypto.randomUUID()}-${safeBaseName}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          key: result.public_id,
          url: result.secure_url,
        });
      }
    );

    // Pipe the buffer into the Cloudinary upload stream
    const readable = Readable.from(fileBuffer);
    readable.pipe(uploadStream);
  });
};

/**
 * Deletes a file from Cloudinary using its public_id.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    throw new Error("Cloudinary deletion failed");
  }
};
