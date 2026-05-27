import { Router } from "express";
import upload from "../middlewares/upload.js";
import { uploadFile, getFiles, deleteFile, moveFile, getDownloadUrl, getFileStats } from "../controllers/file.controller.js";

const router = Router();

router.post("/", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.get("/stats", getFileStats);
router.delete("/:id", deleteFile);
router.patch("/:id/move", moveFile);
router.get("/:id/download", getDownloadUrl);


export default router;
