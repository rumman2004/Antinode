import multer from "multer";

// Use memory storage so the file buffer is available for streaming
// directly to S3 or Cloudinary without touching the local filesystem.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
});

export default upload;
