import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "../types/express.js";
import User from "../models/User.js";

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      if (!process.env.JWT_SECRET) {
        res.status(500).json({ success: false, message: "JWT_SECRET is not configured" });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

      // Find user and attach to request (optional: check if user still exists)
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
         res.status(401).json({ success: false, message: "Not authorized, user not found" });
         return;
      }

      req.userId = decoded.id;
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ success: false, message: "Not authorized, token failed" });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: "Not authorized, no token" });
    return;
  }
};
