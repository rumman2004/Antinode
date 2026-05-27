import type { Request } from "express";

/**
 * Extends the Express Request with an optional `file` populated by Multer,
 * and a placeholder `userId` that will be set by auth middleware later.
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}
