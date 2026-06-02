import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/express.js";
import File from "../models/File.js";
import { uploadToS3, deleteFromS3, getPresignedDownloadUrl } from "../utils/s3Upload.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import Folder from "../models/Folder.js";

/**
 * POST /api/files
 * Upload a file to S3 (default) or Cloudinary (for images).
 */
export const uploadFile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const folderId = (req.body.folderId as string) || null;
    const owner = req.userId || "anonymous";

    if (folderId) {
      if (!mongoose.isValidObjectId(folderId)) {
        res.status(400).json({ success: false, message: "Invalid folder id" });
        return;
      }

      const folderExists = await Folder.exists({ _id: folderId, owner });
      if (!folderExists) {
        res.status(404).json({ success: false, message: "Folder not found" });
        return;
      }
    }

    let storageResult: { key: string; url: string };
    let provider: "s3" | "cloudinary";

    // Route images through Cloudinary for built-in transformations,
    // everything else goes to S3.
    if (mimetype.startsWith("image/")) {
      storageResult = await uploadToCloudinary(buffer, originalname);
      provider = "cloudinary";
    } else {
      storageResult = await uploadToS3(buffer, originalname, mimetype);
      provider = "s3";
    }

    const file = await File.create({
      originalName: originalname,
      mimeType: mimetype,
      size,
      storageKey: storageResult.key,
      storageUrl: storageResult.url,
      storageProvider: provider,
      folder: folderId,
      owner,
    });

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files
 * List files, optionally filtered by folderId.
 */
export const getFiles = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folderId } = req.query;
    const owner = req.userId || "anonymous";

    const filter: Record<string, unknown> = { owner };
    if (folderId) {
      filter.folder = folderId;
    } else {
      filter.folder = null; // root-level files
    }

    const files = await File.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/files/:id
 * Remove a file record (storage cleanup can be added later).
 */
export const deleteFile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.userId || "anonymous",
    });

    if (!file) {
      res.status(404).json({ success: false, message: "File not found" });
      return;
    }

    if (file.storageProvider === "s3") {
      await deleteFromS3(file.storageKey);
    } else if (file.storageProvider === "cloudinary") {
      await deleteFromCloudinary(file.storageKey);
    }

    await File.deleteOne({ _id: file._id, owner: req.userId || "anonymous" });

    res.json({ success: true, message: "File deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/files/:id/move
 * Move a file to a different folder (or to root with folderId: null).
 */
export const moveFile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;
    const owner = req.userId || "anonymous";

    // Verify destination folder exists if provided
    if (folderId) {
      const folderExists = await Folder.exists({ _id: folderId, owner });
      if (!folderExists) {
        res.status(404).json({ success: false, message: "Destination folder not found" });
        return;
      }
    }

    const file = await File.findOneAndUpdate(
      { _id: id, owner },
      { folder: folderId || null },
      { new: true }
    );

    if (!file) {
      res.status(404).json({ success: false, message: "File not found" });
      return;
    }

    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/files/:id/rename
 * Rename a file (update its originalName).
 */
export const renameFile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const owner = req.userId || "anonymous";

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: "Name is required" });
      return;
    }

    const file = await File.findOneAndUpdate(
      { _id: id, owner },
      { originalName: name.trim() },
      { new: true }
    );

    if (!file) {
      res.status(404).json({ success: false, message: "File not found" });
      return;
    }

    res.json({ success: true, data: file });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/:id/download
 * Returns a temporary download URL for the file.
 * S3 files get a presigned URL (1hr). Cloudinary files return the stored URL.
 */
export const getDownloadUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.userId || "anonymous",
    });

    if (!file) {
      res.status(404).json({ success: false, message: "File not found" });
      return;
    }

    let downloadUrl: string;

    if (file.storageProvider === "s3") {
      downloadUrl = await getPresignedDownloadUrl(file.storageKey);
    } else {
      // Cloudinary URLs are already accessible
      downloadUrl = file.storageUrl;
    }

    res.json({
      success: true,
      data: {
        url: downloadUrl,
        fileName: file.originalName,
        mimeType: file.mimeType,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/stats
 * Aggregates statistics for the user: folder count, file count, and total used storage.
 */
export const getFileStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const owner = req.userId || "anonymous";

    const [folderCount, fileCount, sizeResult] = await Promise.all([
      Folder.countDocuments({ owner }),
      File.countDocuments({ owner }),
      File.aggregate([
        { $match: { owner } },
        { $group: { _id: null, totalSize: { $sum: "$size" } } },
      ]),
    ]);

    const totalSize = sizeResult.length > 0 ? sizeResult[0].totalSize : 0;

    res.json({
      success: true,
      data: {
        folders: folderCount,
        files: fileCount,
        usedStorage: totalSize,
      },
    });
  } catch (error) {
    next(error);
  }
};
