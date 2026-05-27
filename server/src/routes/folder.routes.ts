import { Router } from "express";
import {
  createFolder,
  getFolders,
  getFolderContents,
  deleteFolder,
  renameFolder,
} from "../controllers/folder.controller.js";

const router = Router();

router.post("/", createFolder);
router.get("/", getFolders);
router.get("/:id/contents", getFolderContents);
router.delete("/:id", deleteFolder);
router.patch("/:id", renameFolder);

export default router;
