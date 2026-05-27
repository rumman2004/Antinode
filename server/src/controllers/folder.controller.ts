import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../types/express.js";
import Folder from "../models/Folder.js";
import File from "../models/File.js";
import { deleteFromS3 } from "../utils/s3Upload.js";
import { deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

/**
 * POST /api/folders
 * Create a new folder (optionally nested inside a parent).
 */
export const createFolder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, parentId } = req.body;
    const owner = req.userId || "anonymous";

    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
      res.status(400).json({ success: false, message: "Folder name is required" });
      return;
    }

    // Verify parent exists if provided
    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        res.status(400).json({ success: false, message: "Invalid parent folder id" });
        return;
      }

      const parentExists = await Folder.exists({ _id: parentId, owner });
      if (!parentExists) {
        res.status(404).json({ success: false, message: "Parent folder not found" });
        return;
      }
    }

    const folder = await Folder.create({
      name: trimmedName,
      parent: parentId || null,
      owner,
    });

    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/folders
 * List folders at a given level (root by default).
 * Query param: ?parentId=<id>
 */
export const getFolders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { parentId } = req.query;
    const owner = req.userId || "anonymous";

    const filter: Record<string, unknown> = { owner };
    if (parentId) {
      filter.parent = parentId;
    } else {
      filter.parent = null;
    }

    const folders = await Folder.find(filter).sort({ name: 1 });
    res.json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/folders/:id/contents
 * Retrieve a folder's nested children (sub-folders + files).
 */
export const getFolderContents = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const owner = req.userId || "anonymous";

    const folder = await Folder.findOne({ _id: id, owner });
    if (!folder) {
      res.status(404).json({ success: false, message: "Folder not found" });
      return;
    }

    const [subFolders, files] = await Promise.all([
      Folder.find({ parent: id, owner }).sort({ name: 1 }),
      File.find({ folder: id, owner }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        folder,
        subFolders,
        files,
      },
    });
  } catch (error) {
    next(error);
  }
};

const recursivelyDeleteFolder = async (folderId: string, owner: string): Promise<void> => {
  // 1. Recursively delete sub-folders
  const subfolders = await Folder.find({ parent: folderId, owner });
  for (const sub of subfolders) {
    await recursivelyDeleteFolder(sub._id.toString(), owner);
  }

  // 2. Delete all files in this folder
  const files = await File.find({ folder: folderId, owner });
  for (const file of files) {
    try {
      if (file.storageProvider === "s3") {
        await deleteFromS3(file.storageKey);
      } else if (file.storageProvider === "cloudinary") {
        await deleteFromCloudinary(file.storageKey);
      }
    } catch (e) {
      console.error(`Failed to delete file from storage: ${file.storageKey}`, e);
    }
    await File.findByIdAndDelete(file._id);
  }

  // 3. Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
};

/**
 * DELETE /api/folders/:id
 * Delete a folder recursively.
 */
export const deleteFolder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const owner = req.userId || "anonymous";

    const folder = await Folder.findOne({ _id: id, owner });
    if (!folder) {
      res.status(404).json({ success: false, message: "Folder not found" });
      return;
    }

    await recursivelyDeleteFolder(id as string, owner);

    res.json({ success: true, message: "Folder and all contents deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/folders/:id
 * Rename a folder.
 */
export const renameFolder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const owner = req.userId || "anonymous";

    const trimmedName = typeof name === "string" ? name.trim() : "";

    if (!trimmedName) {
      res.status(400).json({ success: false, message: "Folder name is required" });
      return;
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: id, owner },
      { name: trimmedName },
      { new: true }
    );

    if (!folder) {
      res.status(404).json({ success: false, message: "Folder not found" });
      return;
    }

    res.json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};
